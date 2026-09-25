/**
 * MySQL Database Connection Pool - Step 2
 *
 * Uses mysql2/promise for async/await support.
 * Connection values are read entirely from environment variables.
 * Never hard-code passwords or credentials here.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:              process.env.DB_HOST     || 'localhost',
  port:              parseInt(process.env.DB_PORT || '3306', 10),
  user:              process.env.DB_USER     || 'root',
  password:          process.env.DB_PASSWORD || '',
  database:          process.env.DB_NAME     || 'grocery_app',
  waitForConnections: true,
  connectionLimit:   10,
  queueLimit:        0,
  timezone:          '+00:00'   // store/return all datetimes as UTC
});

/**
 * Verify database connectivity.
 * Returns true on success, false on failure.
 * Call this once at server startup.
 */
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    conn.release();
    console.log('✅  MySQL connected successfully.');
    return true;
  } catch (err) {
    console.error('❌  MySQL connection failed:', err.message);
    return false;
  }
}

module.exports = { pool, testConnection };
