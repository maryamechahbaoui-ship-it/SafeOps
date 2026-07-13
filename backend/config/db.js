const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'ocp_surete_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Simple validation function to test connection on startup
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to MySQL database:', process.env.DB_NAME || 'ocp_surete_db');
    connection.release();
  } catch (err) {
    console.error('❌ Database connection failed. Please ensure MySQL is running and database exists.');
    console.error('Error details:', err.message);
  }
}

testConnection();

module.exports = pool;
