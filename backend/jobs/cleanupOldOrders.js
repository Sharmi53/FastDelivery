const { pool } = require('../config/db');
const dryRun = process.env.CLEANUP_DRY_RUN === 'true';
async function cleanupOldOrders() {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Find orders delivered 90 or more days ago
        const [orders] = await connection.query(`
      SELECT id, order_number, delivered_at
      FROM orders
      WHERE order_status = 'delivered'
        AND delivered_at IS NOT NULL
        AND delivered_at <= DATE_SUB(NOW(), INTERVAL 90 DAY)
    `);

        if (orders.length === 0) {
            console.log('✅ No orders older than 90 days need cleanup.');
            await connection.commit();
            return;
        }

        console.log(`🔎 Found ${orders.length} order(s) older than 90 days.`);

        if (dryRun) {
            console.log('🧪 DRY RUN: No orders will be deleted.');

            for (const order of orders) {
                console.log({
                    id: order.id,
                    order_number: order.order_number,
                    delivered_at: order.delivered_at
                });
            }

            await connection.commit();
            return;
        }

        console.log(`🗑️ Deleting ${orders.length} old order(s).`);

        for (const order of orders) {
            // order_items must be deleted first because
            // the foreign key uses ON DELETE RESTRICT.
            await connection.query(
                `DELETE FROM order_items WHERE order_id = ?`,
                [order.id]
            );

            // Then delete the order itself.
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