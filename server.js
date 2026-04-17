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
    database: 'database_toko'
});

db.connect(err => {
    if (err) console.error('Gagal koneksi database:', err);
    else console.log('Database MySQL Terhubung!');
});

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

app.post('/api/transaksi', (req, res) => {
    const { id_barang, jumlah } = req.body;
    db.query("CALL sp_CatatTransaksi(?, ?)", [id_barang, jumlah], (err) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'Transaksi Berhasil! Stok dipotong.' });
    });
});

app.get('/api/history', (req, res) => {
    const query = `
        SELECT t.id_transaksi, b.nama_barang, t.jumlah, t.total_harga, t.waktu_transaksi 
        FROM transaksi t 
        JOIN barang b ON t.id_barang = b.id_barang 
        ORDER BY t.waktu_transaksi DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/stats', (req, res) => {
    const query = "SELECT SUM(total_harga) as total_pendapatan, COUNT(id_transaksi) as total_transaksi FROM transaksi";
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

app.post('/api/barang/add', (req, res) => {
    const { id_barang, nama_barang, harga, stok } = req.body;
    const query = "INSERT INTO barang (id_barang, nama_barang, harga, stok) VALUES (?, ?, ?, ?)";
    db.query(query, [id_barang, nama_barang, harga, stok], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Barang berhasil ditambahkan!' });
    });
});

app.put('/api/barang/:id', (req, res) => {
    const { nama_barang, harga, stok } = req.body;
    const query = "UPDATE barang SET nama_barang = ?, harga = ?, stok = ? WHERE id_barang = ?";
    db.query(query, [nama_barang, harga, stok, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Data barang berhasil diperbarui!' });
    });
});

app.delete('/api/barang/:id', (req, res) => {
    const query = "DELETE FROM barang WHERE id_barang = ?";
    db.query(query, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Barang telah dihapus!' });
    });
});
app.listen(3000, () => console.log(`Server berjalan di http://localhost:3000`));