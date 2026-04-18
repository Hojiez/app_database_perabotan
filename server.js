const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'database_toko' // Pastikan nama DB ini benar
});

db.connect(err => {
    if (err) console.error('Gagal koneksi database:', err);
    else console.log('Database MySQL Terhubung!'); 
});

// --- AUTH & BARANG ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            res.json({ success: true, role: results[0].role, username: results[0].username });
        } else {
            res.status(401).json({ success: false, message: 'Username atau password salah!' });
        }
    });
});

app.get('/api/barang', (req, res) => {
    const search = req.query.search || '';
    db.query("SELECT * FROM barang WHERE nama_barang LIKE ?", [`%${search}%`], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/barang/add', (req, res) => {
    const { id_barang, nama_barang, harga, stok } = req.body;
    db.query("INSERT INTO barang (id_barang, nama_barang, harga, stok) VALUES (?, ?, ?, ?)", [id_barang, nama_barang, harga, stok], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Barang berhasil ditambahkan!' });
    });
});

app.put('/api/barang/:id', (req, res) => {
    const { nama_barang, harga, stok } = req.body;
    db.query("UPDATE barang SET nama_barang = ?, harga = ?, stok = ? WHERE id_barang = ?", [nama_barang, harga, stok, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Data barang berhasil diperbarui!' });
    });
});

app.delete('/api/barang/:id', (req, res) => {
    db.query("DELETE FROM barang WHERE id_barang = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Barang telah dihapus!' });
    });
});

// --- TRANSAKSI ---
app.post('/api/transaksi', (req, res) => {
    const { id_barang, jumlah } = req.body;
    db.query("CALL sp_CatatTransaksi(?, ?)", [id_barang, jumlah], (err) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'Transaksi Berhasil! Stok dipotong.' });
    });
});

// --- ANALYTICS & STATS ---
app.get('/api/admin-stats', (req, res) => {
    const query = `
        SELECT 
            (SELECT SUM(total_harga) FROM transaksi) as total_revenue,
            (SELECT COUNT(*) FROM transaksi) as total_sales,
            (SELECT COUNT(*) FROM barang WHERE stok < 5) as low_stock_count
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

app.get('/api/revenue-trend', (req, res) => {
    const query = `
        SELECT DATE(waktu_transaksi) as transaction_date, SUM(total_harga) as daily_revenue 
        FROM transaksi 
        WHERE waktu_transaksi >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(waktu_transaksi)
        ORDER BY transaction_date ASC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/top-selling', (req, res) => {
    const query = `
        SELECT b.nama_barang, SUM(t.jumlah) as total_terjual
        FROM transaksi t
        JOIN barang b ON t.id_barang = b.id_barang
        GROUP BY t.id_barang
        ORDER BY total_terjual DESC
        LIMIT 3
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.listen(3000, () => console.log(`Server berjalan di http://localhost:3000`));