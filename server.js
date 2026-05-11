const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Dibutuhkan untuk koneksi eksternal ke Railway
  }
});

pool.connect((err) => {
  if (err) console.error('Gagal koneksi ke Postgres:', err.stack);
  else console.log('Database Postgres Terhubung!');
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'database_toko',
  port: process.env.MYSQLPORT || 3307 // Sesuaikan port lokal kamu jika berbeda
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});

db.connect(err => {
    if (err) console.error('Gagal koneksi database:', err);
    else console.log('Database MySQL Terhubung!'); 
});

// --- AUTH ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Postgres menggunakan $1, $2 dst untuk placeholder, bukan ?
        const results = await pool.query("SELECT * FROM users WHERE username = $1 AND password = $2", [username, password]);
        if (results.rows.length > 0) {
            res.json({ success: true, role: results.rows[0].role, username: results.rows[0].username });
        } else {
            res.status(401).json({ success: false, message: 'Username atau password salah!' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- BARANG ---
app.get('/api/barang', async (req, res) => {
    const search = req.query.search || '';
    try {
        const results = await pool.query("SELECT * FROM barang WHERE nama_barang ILIKE $1", [`%${search}%`]);
        res.json(results.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/barang/add', async (req, res) => {
    const { barang_id, nama_barang, kategori, harga, stok } = req.body;
    try {
        await pool.query("INSERT INTO barang (barang_id, nama_barang, kategori, harga, stok) VALUES ($1, $2, $3, $4, $5)", 
        [barang_id, nama_barang, kategori, harga, stok]);
        res.json({ message: 'Barang berhasil ditambahkan!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/barang/:id', async (req, res) => {
    const { nama_barang, harga, stok } = req.body;
    try {
        await pool.query("UPDATE barang SET nama_barang = $1, harga = $2, stok = $3 WHERE barang_id = $4", 
        [nama_barang, harga, stok, req.params.id]);
        res.json({ message: 'Data barang berhasil diperbarui!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/barang/:id', async (req, res) => {
    try {
        await pool.query("DELETE FROM barang WHERE barang_id = $1", [req.params.id]);
        res.json({ message: 'Barang telah dihapus!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- TRANSAKSI (Sistem Checkout) ---
app.post('/api/transaksi', async (req, res) => {
    const { id_barang, jumlah } = req.body;
    try {
        await pool.query("UPDATE barang SET stok = stok - $1 WHERE barang_id = $2", [jumlah, id_barang]);
        res.json({ message: 'Transaksi Berhasil! Stok dipotong.' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- ANALYTICS & STATS (DASHBOARD ADMIN) ---
app.get('/api/admin-stats', async (req, res) => {
    try {
        const query = `
            SELECT 
                (SELECT SUM(total_harga) FROM transaksi) as total_revenue,
                (SELECT COUNT(*) FROM transaksi) as total_sales,
                (SELECT COUNT(*) FROM barang WHERE stok < 5) as low_stock_count
        `;
        const results = await pool.query(query);
        res.json(results.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/revenue-trend', async (req, res) => {
    try {
        // Penyesuaian sintaks tanggal Postgres
        const query = `
            SELECT DATE(tanggal_transaksi) as transaction_date, SUM(total_harga) as daily_revenue 
            FROM transaksi 
            WHERE tanggal_transaksi >= CURRENT_DATE - INTERVAL '6 days'
            GROUP BY DATE(tanggal_transaksi)
            ORDER BY transaction_date ASC
        `;
        const results = await pool.query(query);
        res.json(results.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/top-selling', (req, res) => {
    const query = `
        SELECT b.nama_barang, SUM(dt.jumlah_barang) as total_terjual
        FROM detail_transaksi dt
        JOIN barang b ON dt.barang_id = b.barang_id
        GROUP BY dt.barang_id
        ORDER BY total_terjual DESC
        LIMIT 3
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});