// MySQL connection + table setup (uses the "mysql2" package).
import 'dotenv/config'; // reads server/.env
import mysql from 'mysql2/promise';

const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};
export const DB_NAME = process.env.DB_NAME || 'stufftrade';

let pool;

// Called once when the server starts: creates the database + tables if they don't exist yet.
export async function initDb() {
  const boot = await mysql.createConnection(baseConfig);
  await boot.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await boot.end();

  pool = mysql.createPool({
    ...baseConfig,
    database: DB_NAME,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true, // dates come back as "2026-11-12 08:30:00" text
  });
  // keep every connection on UTC so "2 days ago" is correct for everyone
  pool.pool.on('connection', (conn) => conn.query("SET time_zone = '+00:00'"));

  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      name          VARCHAR(100) NOT NULL,
      email         VARCHAR(190) NOT NULL UNIQUE,
      mobile        VARCHAR(20)  NOT NULL UNIQUE,
      area          VARCHAR(100) NOT NULL,
      password_hash VARCHAR(100) NOT NULL,
      photo         VARCHAR(255) NULL,
      created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS posts (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      user_id     INT NOT NULL,
      title       VARCHAR(80)  NOT NULL,
      category    VARCHAR(40)  NOT NULL,
      description TEXT NOT NULL,
      wants       VARCHAR(120) NOT NULL,
      area        VARCHAR(100) NOT NULL,
      status      VARCHAR(10)  NOT NULL DEFAULT 'open',   -- open | traded
      photos      TEXT NOT NULL,                          -- JSON list of image urls
      created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS offers (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      post_id    INT NOT NULL,
      user_id    INT NOT NULL,
      item       VARCHAR(200) NOT NULL,
      cash       INT NOT NULL DEFAULT 0,
      message    TEXT NOT NULL,
      photos     TEXT NOT NULL,
      status     VARCHAR(10) NOT NULL DEFAULT 'pending',  -- pending | chosen | declined
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS saved (
      user_id INT NOT NULL,
      post_id INT NOT NULL,
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ];
  for (const sql of tables) await pool.query(sql);
}

// Small helpers used by the routes.
export const all = async (sql, params = []) => (await pool.query(sql, params))[0]; // array of rows
export const get = async (sql, params = []) => (await all(sql, params))[0];         // first row or undefined
export const run = async (sql, params = []) => (await pool.query(sql, params))[0];  // { insertId, affectedRows }
export const getConnection = () => pool.getConnection();                            // for transactions
export const closeDb = () => pool?.end();
