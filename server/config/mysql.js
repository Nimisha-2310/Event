const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

let pool = null;
let isConnected = false;
let connectionError = null;

const dbConfig = {
  host: process.env.MYSQL_HOST || "127.0.0.1",
  user: process.env.MYSQL_USER || "eventuser",
  password: process.env.MYSQL_PASSWORD || "Event@123",
  port: Number(process.env.MYSQL_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Auto-initialize MySQL Database & Table
async function initMySQL() {
  try {
    // Step 1: Connect to server to ensure database exists
    const rootConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
    });

    await rootConnection.query("CREATE DATABASE IF NOT EXISTS EventConnectDB;");
    await rootConnection.end();

    // Step 2: Create connection pool with the database selected
    pool = mysql.createPool({
      ...dbConfig,
      database: process.env.MYSQL_DATABASE || "EventConnectDB",
    });

    // Step 3: Create the bookings table
    const createTableSQL = `
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                event VARCHAR(255) NOT NULL,
                tickets INT NOT NULL DEFAULT 1,
                booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
    await pool.query(createTableSQL);

    // Step 4: Seed default records if table is empty
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM bookings");
    if (rows[0].count === 0) {
      console.log("Seeding initial MySQL booking records...");
      const seedSQL = `
                INSERT INTO bookings (name, email, event, tickets) VALUES
                ('Aarav Sharma', 'aarav@gmail.com', 'EDM Music Festival', 2),
                ('Nimisha Singh', 'nimisha@gmail.com', 'AI & Tech Conference', 1);
            `;
      await pool.query(seedSQL);
    }

    isConnected = true;
    connectionError = null;
    console.log("🐬 MySQL Database Connected & Initialized successfully! ✅");
    return pool;
  } catch (err) {
    isConnected = false;
    connectionError = err.message;
    console.warn(`⚠️ MySQL Connection note: ${err.message}`);
    console.warn(
      "💡 Tip: Ensure MySQL server is running (e.g., sudo systemctl start mysql or XAMPP).",
    );
    return null;
  }
}

// Function to get the active pool
const getMySQLPool = () => pool;
const isMySQLReady = () => isConnected;
const getMySQLStatus = () => ({
  connected: isConnected,
  database: "EventConnectDB",
  table: "bookings",
  host: dbConfig.host,
  port: dbConfig.port,
  error: connectionError,
});

module.exports = {
  initMySQL,
  getMySQLPool,
  isMySQLReady,
  getMySQLStatus,
};
