const { pool } = require('../config/db');
const dryRun = process.env.CLEANUP_DRY_RUN === 'true';
async function cleanupOldOrders() {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Find orders eligible for cleanup:
        //   - DELIVERED: delivered_at >= 60 days ago
        //   - CANCELLED: cancelled_at >= 60 days ago
        const [orders] = await connection.query(`
      SELECT id, order_number, order_status, delivered_at, cancelled_at
      FROM orders
      WHERE (
        order_status = 'delivered'
        AND delivered_at IS NOT NULL
        AND delivered_at <= DATE_SUB(NOW(), INTERVAL 60 DAY)
      )
      OR (
        order_status = 'cancelled'
        AND cancelled_at IS NOT NULL
        AND cancelled_at <= DATE_SUB(NOW(), INTERVAL 60 DAY)
      )
    `);

        if (orders.length === 0) {
            console.log('✅ No orders older than 60 days need cleanup.');
            await connection.commit();
            return;
        }

        console.log(`🔎 Found ${orders.length} order(s) older than 60 days.`);

        if (dryRun) {
            console.log('🧪 DRY RUN: No orders will be deleted.');

            for (const order of orders) {
                const timestamp =
                    order.order_status === 'cancelled'
                        ? order.cancelled_at
                        : order.delivered_at;
                console.log({
                    id: order.id,
                    order_number: order.order_number,
                    order_status: order.order_status,
                    retention_timestamp: timestamp
                });
            }

            await connection.commit();
            return;
        }

        console.log(`🗑️ Deleting ${orders.length} old order(s).`);

        for (const order of orders) {
            // 1. Delete order_items first (ON DELETE RESTRICT).
            await connection.query(
                `DELETE FROM order_items WHERE order_id = ?`,
                [order.id]
            );

            // 2. Delete payments (ON DELETE RESTRICT).
            await connection.query(
                `DELETE FROM payments WHERE order_id = ?`,
                [order.id]
            );

            // 3. Delete delivery_assignments (ON DELETE RESTRICT).
            await connection.query(
                `DELETE FROM delivery_assignments WHERE order_id = ?`,
                [order.id]
            );

            // 4. Delete the order itself.
            // Related notifications will automatically
            // have order_id changed to NULL because
            // notifications uses ON DELETE SET NULL.
            await connection.query(
                `DELETE FROM orders WHERE id = ?`,
                [order.id]
            );

            console.log(
                `🗑️ Deleted order ${order.order_number} (ID: ${order.id})`
            );
        }

        await connection.commit();

        console.log(
            `✅ Successfully cleaned up ${orders.length} order(s).`
        );
    } catch (error) {
        await connection.rollback();

        console.error(
            '❌ Old order cleanup failed:',
            error
        );

        throw error;
    } finally {
        connection.release();
    }
}

module.exports = cleanupOldOrders;

if (require.main === module) {
    cleanupOldOrders()
        .then(() => {
            console.log('✅ Cleanup job finished.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Cleanup job failed:', error);
            process.exit(1);
        });
}