const crypto = require('crypto');
const Razorpay = require('razorpay');
const { pool } = require('../config/db');
const { sendAdminNewOrderEmail } = require('../utils/email');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});
async function refundRazorpayPayment(
    razorpayPaymentId,
    amountInPaise
) {
    return razorpay.payments.refund(
        razorpayPaymentId,
        {
            amount: amountInPaise
        }
    );
}
/**
 * Verify the Razorpay checkout signature.
 */
function verifyRazorpaySignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
}) {
    const generatedSignature = crypto
        .createHmac(
            'sha256',
            process.env.RAZORPAY_KEY_SECRET
        )
        .update(
            `${razorpayOrderId}|${razorpayPaymentId}`
        )
        .digest('hex');

    return generatedSignature === razorpaySignature;
}

/**
 * Finalize a successful online payment.
 *
 * This function is intentionally idempotent:
 * if the order has already been finalized it returns
 * the existing data without performing any DB writes.
 *
 * NEW FLOW:
 * - No order/address/payment record exists before this call.
 * - The session (items, address, pricing) was stored in
 *   memory during /initiate and is passed in here.
 * - After verifying the Razorpay signature and confirming
 *   the payment is captured, ALL DB writes happen inside
 *   a single atomic transaction.
 *
 * This function can safely be called by:
 * 1. Customer frontend /confirm handler
 * 2. Razorpay webhook (payment.captured)
 *
 * Only one call will actually finalize the order due to
 * idempotency protected by a duplicate-check on
 * razorpay_order_id in the payments table.
 */
async function finalizeOnlineOrder({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature = null,
    userId = null,
    session
}) {
    // --------------------------------------------------
    // Session is required — it carries items, address,
    // and server-computed pricing from /initiate.
    // --------------------------------------------------
    if (!session) {
        throw new Error(
            'Payment session is missing. Cannot finalize order without checkout data.'
        );
    }

    const {
        orderNumber,
        address,
        orderItems,
        subtotal,
        deliveryCharge,
        discountAmount,
        totalAmount
    } = session;

    // userId from session is the authoritative owner.
    const sessionUserId = session.userId;

    // Enforce ownership when called from the frontend.
    if (userId !== null && Number(userId) !== Number(sessionUserId)) {
        throw new Error('You are not authorized to confirm this payment.');
    }

    let connection;
    let paymentCaptured = false;
    const expectedAmountInPaise = Math.round(Number(totalAmount) * 100);

    try {
        // ==================================================
        // 0. Idempotency check BEFORE opening a transaction
        //
        // If a previous call already inserted the payment
        // record (e.g. webhook fired before /confirm or
        // customer double-tapped), return early.
        // ==================================================
        const [existingPayment] = await pool.execute(
            `
      SELECT
        p.id,
        p.order_id,
        p.payment_status,
        o.order_number,
        o.order_status,
        o.total_amount
      FROM payments p
      INNER JOIN orders o ON o.id = p.order_id
      WHERE p.razorpay_order_id = ?
      LIMIT 1
      `,
            [razorpayOrderId]
        );

        if (existingPayment.length > 0) {
            const existing = existingPayment[0];
            return {
                alreadyFinalized: true,
                orderId: existing.order_id,
                orderNumber: existing.order_number,
                paymentStatus: existing.payment_status,
                orderStatus: existing.order_status,
                totalAmount: Number(existing.total_amount)
            };
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // ==================================================
        // 1. Verify frontend signature when provided
        // ==================================================
        if (razorpaySignature) {
            const validSignature = verifyRazorpaySignature({
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature
            });

            if (!validSignature) {
                throw new Error(
                    'Razorpay payment signature verification failed.'
                );
            }
        }

        // ==================================================
        // 2. Fetch Razorpay order from Razorpay API
        // ==================================================
        const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);

        if (Number(razorpayOrder.amount) !== expectedAmountInPaise) {
            throw new Error(
                'Razorpay payment amount does not match the order total.'
            );
        }

        // ==================================================
        // 3. Fetch Razorpay payment from Razorpay API
        // ==================================================
        const razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);

        if (razorpayPayment.order_id !== razorpayOrderId) {
            throw new Error(
                'Razorpay payment does not belong to this Razorpay order.'
            );
        }

        if (Number(razorpayPayment.amount) !== expectedAmountInPaise) {
            throw new Error(
                'Razorpay payment amount does not match the order total.'
            );
        }

        // ==================================================
        // 4. Payment MUST be captured before we create the order
        // ==================================================
        if (razorpayPayment.status !== 'captured') {
            throw new Error(
                `Razorpay payment is not captured. Current status: ${razorpayPayment.status}`
            );
        }

        paymentCaptured = true;

        // ==================================================
        // 5. Re-validate and lock stock inside the transaction
        // ==================================================
        let stockError = null;

        for (const item of orderItems) {
            const [products] = await connection.execute(
                `
      SELECT id, name, stock_quantity, status
      FROM products
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
                [item.productId]
            );

            if (products.length === 0) {
                stockError = `Product ${item.productId} was not found.`;
                break;
            }

            const product = products[0];

            if (product.status !== 'active') {
                stockError = `${product.name} is currently unavailable.`;
                break;
            }

            if (Number(product.stock_quantity) < Number(item.quantity)) {
                stockError =
                    `Only ${product.stock_quantity} unit(s) of ${product.name} are available.`;
                break;
            }
        }

        // ==================================================
        // 5B. Refund if stock is unavailable after capture
        // ==================================================
        if (stockError) {
            await connection.rollback();

            try {
                console.log('⚠️ Stock unavailable after Razorpay capture. Reason:', stockError);
                console.log('Refunding Razorpay payment:', razorpayPaymentId);

                await refundRazorpayPayment(razorpayPaymentId, expectedAmountInPaise);

                console.log('✅ Razorpay refund created successfully.');
            } catch (refundError) {
                console.error('❌ Razorpay refund failed:', refundError);
                throw new Error(
                    'Payment was captured, but the automatic refund failed. Please contact support.'
                );
            }

            throw new Error(stockError);
        }

        // ==================================================
        // 6. Insert delivery address
        // ==================================================
        const [addressResult] = await connection.execute(
            `
      INSERT INTO addresses (
        user_id,
        full_name,
        phone,
        address_line,
        landmark,
        city,
        state,
        pincode,
        latitude,
        longitude,
        is_default,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
            [
                sessionUserId,
                address.fullName,
                address.phone,
                address.addressLine,
                address.landmark || '',
                address.city,
                address.state,
                address.pincode,
                address.latitude || null,
                address.longitude || null,
                0
            ]
        );

        const addressId = addressResult.insertId;

        // ==================================================
        // 7. Insert order
        // ==================================================
        const [orderResult] = await connection.execute(
            `
      INSERT INTO orders (
        user_id,
        address_id,
        order_number,
        subtotal,
        delivery_charge,
        discount,
        total_amount,
        payment_method,
        payment_status,
        order_status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
            [
                sessionUserId,
                addressId,
                orderNumber,
                subtotal.toFixed(2),
                deliveryCharge.toFixed(2),
                discountAmount.toFixed(2),
                totalAmount.toFixed(2),
                'online',
                'paid',
                'placed'
            ]
        );

        const orderId = orderResult.insertId;

        // ==================================================
        // 8. Insert order items
        // ==================================================
        for (const item of orderItems) {
            await connection.execute(
                `
      INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        price,
        quantity,
        subtotal,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
                [
                    orderId,
                    item.productId,
                    item.productName,
                    item.price.toFixed(2),
                    item.quantity,
                    item.subtotal.toFixed(2)
                ]
            );
        }

        // ==================================================
        // 9. Deduct stock
        // ==================================================
        for (const item of orderItems) {
            const [stockResult] = await connection.execute(
                `
      UPDATE products
      SET stock_quantity = stock_quantity - ?, updated_at = NOW()
      WHERE id = ?
      `,
                [item.quantity, item.productId]
            );

            if (stockResult.affectedRows === 0) {
                throw new Error(
                    `Failed to update stock for product ${item.productId}.`
                );
            }
        }

        // ==================================================
        // 10. Insert payment record as 'paid'
        // ==================================================
        await connection.execute(
            `
      INSERT INTO payments (
        order_id,
        payment_method,
        transaction_id,
        razorpay_order_id,
        amount,
        payment_status,
        paid_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
      `,
            [
                orderId,
                'online',
                razorpayPaymentId,
                razorpayOrderId,
                totalAmount.toFixed(2),
                'paid'
            ]
        );

        // ==================================================
        // 11. Commit everything atomically
        // ==================================================
        await connection.commit();

        console.log(
            `✅ Order finalized: ${orderNumber} (orderId=${orderId}, razorpayPaymentId=${razorpayPaymentId})`
        );

        // ==================================================
        // 12. Send admin email after successful commit
        // ==================================================
        //
        // The email is deliberately outside the DB transaction.
        // An email failure must never undo a successful payment.
        //
        try {
            const [customerRows] = await pool.execute(
                `SELECT id, name, email, phone FROM users WHERE id = ? LIMIT 1`,
                [sessionUserId]
            );

            const customer = customerRows[0] || {};

            sendAdminNewOrderEmail({
                orderNumber,
                orderId,

                customerName:
                    customer.name ||
                    address.fullName ||
                    'Customer',

                customerEmail: customer.email || '',

                customerPhone:
                    customer.phone ||
                    address.phone ||
                    '',

                orderDate: new Date().toISOString(),

                items: orderItems,

                subtotal: Number(subtotal).toFixed(2),
                deliveryCharge: Number(deliveryCharge).toFixed(2),
                discount: Number(discountAmount).toFixed(2),
                totalAmount: Number(totalAmount).toFixed(2),

                paymentMethod: 'online',
                paymentStatus: 'paid',
                orderStatus: 'placed',

                address
            }).then(() => {
                console.log(`✅ Admin email sent for order ${orderNumber}`);
            }).catch((emailError) => {
                console.error(
                    `❌ Admin email failed for order ${orderNumber}:`,
                    emailError.message
                );
            });

        } catch (emailPreparationError) {
            console.error(
                'Admin email preparation failed:',
                emailPreparationError.message
            );
        }

        return {
            alreadyFinalized: false,
            orderId,
            orderNumber,
            paymentStatus: 'paid',
            orderStatus: 'placed',
            totalAmount: Number(totalAmount)
        };

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        // ==================================================
        // Payment recovery
        // ==================================================
        //
        // If Razorpay already captured the payment but our
        // DB insertion failed, refund the customer.
        //
        if (paymentCaptured) {
            try {
                console.log(
                    '⚠️ Payment was captured but order finalization failed. Starting automatic Razorpay refund:',
                    razorpayPaymentId
                );

                await refundRazorpayPayment(
                    razorpayPaymentId,
                    expectedAmountInPaise
                );

                console.log('✅ Automatic Razorpay refund completed.');

            } catch (refundError) {
                console.error(
                    '❌ CRITICAL: Razorpay refund failed after captured payment:',
                    refundError
                );
                // Keep the original error for the API response.
            }
        }

        throw error;

    } finally {
        if (connection) {
            connection.release();
        }
    }
}

module.exports = {
    verifyRazorpaySignature,
    finalizeOnlineOrder
};