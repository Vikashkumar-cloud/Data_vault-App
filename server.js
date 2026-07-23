const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

/* ── STEP 1: BASE CONNECTION (NO DB) ── */
const basePool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  connectionLimit: 5
});

let pool; // final pool after DB creation

/* ── STEP 2: INIT DB + TABLE ── */
async function initDB() {
  let conn;

  try {
    conn = await basePool.getConnection();

    await conn.query(`CREATE DATABASE IF NOT EXISTS datavault`);
    await conn.query(`USE datavault`);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(80) NOT NULL,
        email VARCHAR(120) DEFAULT '',
        category ENUM('work','personal','project','other') DEFAULT 'work',
        notes VARCHAR(200) DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ DB & Table ready");
  } catch (err) {
    console.error("❌ DB init error:", err);
    process.exit(1);
  } finally {
    if (conn) conn.release();
  }

  /* ── STEP 3: CREATE FINAL POOL AFTER DB EXISTS ── */
  pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5
  });
}

/* ── APIs (UNCHANGED LOGIC) ── */

app.get('/api/records', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM records ORDER BY id DESC');
    res.json(rows.filter(r => r.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

app.post('/api/records', async (req, res) => {
  const { name, email, category, notes } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    const result = await conn.query(
      `INSERT INTO records (name, email, category, notes)
       VALUES (?, ?, ?, ?)`,
      [
        name.trim(),
        email || '',
        category || 'other',
        notes || ''
      ]
    );

    res.json({ id: Number(result.insertId) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

app.delete('/api/records/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();

    const result = await conn.query(
      'DELETE FROM records WHERE id = ?',
      [req.params.id]
    );

    res.json({ deleted: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

/* ── START SERVER ONLY AFTER DB INIT ── */
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running → http://localhost:${PORT}`);
  });
});