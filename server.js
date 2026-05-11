const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

// Konfigurasi Database Postgres (Railway)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
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

// --- AUTH ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
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

// --- TRANSAKSI ---
app.post('/api/transaksi', async (req, res) => {
    // Pastikan menggunakan id_barang (sesuai kiriman body)
    const { id_barang, jumlah, total_harga, username } = req.body;
    
    try {
        // 1. Mulai Transaksi Database
        await pool.query('BEGIN');

        // 2. Buat ID Transaksi Unik
        const transaksiId = `TRX-${Date.now()}`;

        // 3. Masukkan ke tabel transaksi (Header)
        await pool.query(
            "INSERT INTO transaksi (transaksi_id, user_id, tanggal_transaksi, total_harga, status_transaksi) VALUES ($1, (SELECT user_id FROM users WHERE username = $2), CURRENT_TIMESTAMP, $3, 'Sukses')",
            [transaksiId, username, total_harga]
        );

        // 4. Masukkan ke tabel detail_transaksi
        await pool.query(
    "INSERT INTO detail_transaksi (transaksi_id, barang_id, jumlah_barang, subtotal, harga_satuan) VALUES ($1, $2, $3, $4, ($4::numeric / $3::int))",
    [transaksiId, id_barang, jumlah, total_harga]
    );

        // 5. Update Stok di tabel barang
        const updateStok = await pool.query(
            "UPDATE barang SET stok = stok - $1 WHERE barang_id = $2 RETURNING stok",
            [jumlah, id_barang]
        );

        if (updateStok.rowCount === 0) {
            throw new Error('Barang tidak ditemukan');
        }

        // 6. Selesaikan Transaksi
        await pool.query('COMMIT');
        res.json({ success: true, message: 'Transaksi tercatat dan stok diperbarui!' });

    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// --- ANALYTICS ---
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

app.get('/api/top-selling', async (req, res) => {
    try {
        const query = `
            SELECT b.nama_barang, SUM(dt.jumlah_barang) as total_terjual
            FROM detail_transaksi dt
            JOIN barang b ON dt.barang_id = b.barang_id
            GROUP BY b.nama_barang
            ORDER BY total_terjual DESC
            LIMIT 3
        `;
        const results = await pool.query(query);
        res.json(results.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});