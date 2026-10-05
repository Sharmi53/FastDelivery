const crypto = require('crypto');
const Razorpay = require('razorpay');
const { pool } = require('../config/db');
const { sendAdminNewOrderEmail } = require('../utils/email');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

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
 * This function is intentionally idempotent.
 *
 * It can safely be called by:
 * 1. Customer frontend confirmation
 * 2. Razorpay webhook
 *
 * Only one call will actually finalize the order.
 */
async function finalizeOnlineOrder({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature = null,
    userId = null
}) {
    let connection;

    try {
        connection = await pool.getConnection();

        await connection.beginTransaction();

        // ==================================================
        // 1. Find and lock the payment record
        // ==================================================
        const [paymentRows] = await connection.execute(
            `
      SELECT
        p.id,
        p.order_id,
        p.payment_method,
        p.transaction_id,
        p.razorpay_order_id,
        p.amount,
        p.payment_status,

        o.user_id,
        o.order_number,
        o.subtotal,
        o.delivery_charge,
        o.discount,
        o.total_amount,
        o.payment_status AS order_payment_status,
        o.order_status,
        o.address_id

      FROM payments p

      INNER JOIN orders o
        ON o.id = p.order_id

      WHERE p.razorpay_order_id = ?

      LIMIT 1

      FOR UPDATE
      `,
            [razorpayOrderId]
        );

        if (paymentRows.length === 0) {
            throw new Error(
                'Payment record not found for this Razorpay order.'
            );
        }

        const payment = paymentRows[0];

        // ==================================================
        // 2. Make sure the payment belongs to this customer
        // ==================================================
        if (
            userId !== null &&
            Number(payment.user_id) !== Number(userId)
        ) {
            throw new Error(
                'You are not authorized to confirm this payment.'
            );
        }

        // ==================================================
        // 3. Idempotency check
        // ==================================================
        //
        // If another request already finalized this payment,
        // simply return the existing order.
        //
        if (
            payment.payment_status === 'paid' &&
            payment.order_payment_status === 'paid'
        ) {
            await connection.commit();

            return {
                alreadyFinalized: true,
                orderId: payment.order_id,
                orderNumber: payment.order_number,
                paymentStatus: 'paid',
                orderStatus: payment.order_status,
                totalAmount: Number(payment.total_amount)
            };
        }

        // ==================================================
        // 4. Verify frontend signature when provided
        // ==================================================
        //
        // Webhook requests do not use this checkout signature.
        // They use the Razorpay webhook signature separately.
        //
        if (razorpaySignature) {
            const validSignature =
                verifyRazorpaySignature({
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
        // 5. Fetch Razorpay order from Razorpay
        // ==================================================
        const razorpayOrder =
            await razorpay.orders.fetch(
                razorpayOrderId
            );

        const expectedAmountInPaise = Math.round(
            Number(payment.total_amount) * 100
        );

        // ==================================================
        // 6. Verify Razorpay order amount
        // ==================================================
        if (
            Number(razorpayOrder.amount) !==
            expectedAmountInPaise
        ) {
            throw new Error(
                'Razorpay payment amount does not match the order total.'
            );
        }

        // ==================================================
        // 7. Fetch Razorpay payment
        // ==================================================
        const razorpayPayment =
            await razorpay.payments.fetch(
                razorpayPaymentId
            );

        // ==================================================
        // 8. Verify payment belongs to the Razorpay order
        // ==================================================
        if (
            razorpayPayment.order_id !==
            razorpayOrderId
        ) {
            throw new Error(
                'Razorpay payment does not belong to this Razorpay order.'
            );
        }

        // ==================================================
        // 9. Verify payment amount
        // ==================================================
        if (
            Number(razorpayPayment.amount) !==
            expectedAmountInPaise
        ) {
            throw new Error(
                'Razorpay payment amount does not match the order total.'
            );
        }

        // ==================================================
        // 10. Payment must be captured
        // ==================================================
        if (
            razorpayPayment.status !== 'captured'
        ) {
            throw new Error(
                `Razorpay payment is not captured. Current status: ${razorpayPayment.status}`
            );
        }

        // ==================================================
        // 11. Lock all order items
        // ==================================================
        const [orderItems] =
            await connection.execute(
                `
        SELECT
          id,
          product_id,
          product_name,
          price,
          quantity,
          subtotal

        FROM order_items

        WHERE order_id = ?

        ORDER BY id ASC

        FOR UPDATE
        `,
                [payment.order_id]
            );

        if (orderItems.length === 0) {
            throw new Error(
                'No order items were found for this payment.'
            );
        }

        // ==================================================
        // 12. Check stock safely
        // ==================================================
        for (const item of orderItems) {
            const [products] =
                await connection.execute(
                    `
          SELECT
            id,
            name,
            stock_quantity,
            status

          FROM products

          WHERE id = ?

          LIMIT 1

          FOR UPDATE
          `,
                    [item.product_id]
                );

            if (products.length === 0) {
                throw new Error(
                    `Product ${item.product_id} was not found.`
                );
            }

            const product = products[0];

            if (product.status !== 'active') {
                throw new Error(
                    `${product.name} is currently unavailable.`
                );
            }

            if (
                Number(product.stock_quantity) <
                Number(item.quantity)
            ) {
                throw new Error(
                    `Only ${product.stock_quantity} unit(s) of ${product.name} are available.`
                );
            }
        }

        // ==================================================
        // 13. Deduct stock
        // ==================================================
        for (const item of orderItems) {
            const [stockResult] =
                await connection.execute(
                    `
          UPDATE products

          SET
            stock_quantity =
              stock_quantity - ?,
            updated_at = NOW()

          WHERE id = ?
          `,
                    [
                        item.quantity,
                        item.product_id
                    ]
                );

            if (stockResult.affectedRows === 0) {
                throw new Error(
                    `Failed to update stock for product ${item.product_id}.`
                );
            }
        }

        // ==================================================
        // 14. Mark payment as paid
        // ==================================================
        await connection.execute(
            `
      UPDATE payments

      SET
        transaction_id = ?,
        payment_status = 'paid',
        paid_at = NOW(),
        updated_at = NOW()

      WHERE id = ?
      `,
            [
                razorpayPaymentId,
                payment.id
            ]
        );

        // ==================================================
        // 15. Mark order payment as paid
        //
        // IMPORTANT:
        // We keep order_status = 'placed'.
        //
        // Admin still controls the business workflow:
        // placed → confirmed → preparing → ready_for_pickup
        // ==================================================
        await connection.execute(
            `
      UPDATE orders

      SET
        payment_status = 'paid',
        updated_at = NOW()

      WHERE id = ?
      `,
            [payment.order_id]
        );

        await connection.commit();

        // ==================================================
        // 16. Send admin email after successful commit
        // ==================================================
        //
        // The email is deliberately outside the DB transaction.
        // An email failure must never undo a successful payment.
        //
        try {
            const [customerRows] =
                await pool.execute(
                    `
          SELECT
            id,
            name,
            email,
            phone

          FROM users

          WHERE id = ?

          LIMIT 1
          `,
                    [payment.user_id]
                );

            const customer =
                customerRows[0] || {};

            const [addressRows] =
                await pool.execute(
                    `
          SELECT
            full_name,
            phone,
            address_line,
            landmark,
            city,
            state,
            pincode,
            latitude,
            longitude

          FROM addresses

          WHERE id = ?

          LIMIT 1
          `,
                    [payment.address_id]
                );

            const address =
                addressRows[0] || {};

            sendAdminNewOrderEmail({
                orderNumber: payment.order_number,
                orderId: payment.order_id,

                customerName:
                    customer.name ||
                    address.full_name ||
                    'Customer',

                customerEmail:
                    customer.email || '',

                customerPhone:
                    customer.phone ||
                    address.phone ||
                    '',

                orderDate:
                    new Date().toISOString(),

                items: orderItems,

                subtotal:
                    Number(payment.subtotal).toFixed(2),

                deliveryCharge:
                    Number(payment.delivery_charge).toFixed(2),

                discount:
                    Number(payment.discount).toFixed(2),

                totalAmount:
                    Number(payment.total_amount).toFixed(2),

                paymentMethod: 'online',
                paymentStatus: 'paid',
                orderStatus: payment.order_status,

                address
            }).then(() => {
                console.log(
                    `✅ Admin email sent for order ${payment.order_number}`
                );
            }).catch((emailError) => {
                console.error(
                    `❌ Admin email failed for order ${payment.order_number}:`,
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
            orderId: payment.order_id,
            orderNumber: payment.order_number,
            paymentStatus: 'paid',
            orderStatus: payment.order_status,
            totalAmount: Number(payment.total_amount)
        };

    } catch (error) {
        if (connection) {
            await connection.rollback();
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