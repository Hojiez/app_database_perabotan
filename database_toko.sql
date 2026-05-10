-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 11, 2026 at 01:19 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `database_toko`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_CatatTransaksi` (IN `p_id_barang` VARCHAR(10), IN `p_jumlah` INT)   BEGIN
    DECLARE v_harga INT;
    DECLARE v_total_harga INT;
    DECLARE v_stok_sekarang INT;

    -- 1. Ambil harga dan stok barang saat ini dari tabel master
    SELECT harga, stok INTO v_harga, v_stok_sekarang
    FROM barang 
    WHERE id_barang = p_id_barang;

    -- 2. Validasi: Pastikan stok tidak kurang dari jumlah yang mau dibeli
    IF v_stok_sekarang >= p_jumlah THEN
        
        -- 3. Hitung total harga otomatis
        SET v_total_harga = v_harga * p_jumlah;

        -- 4. Masukkan data ke tabel transaksi (Trigger otomatis jalan setelah ini)
        INSERT INTO transaksi (id_barang, jumlah, total_harga)
        VALUES (p_id_barang, p_jumlah, v_total_harga);
        
        SELECT 'SUKSES: Transaksi berhasil dicatat dan stok dipotong.' AS Pesan;

    ELSE
        -- 5. Lemparkan error jika stok tidak cukup, agar backend tahu transaksi gagal
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'GAGAL: Stok barang tidak mencukupi untuk transaksi ini!';
    END IF;

END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `barang`
--

CREATE TABLE `barang` (
  `barang_id` varchar(10) NOT NULL,
  `nama_barang` varchar(100) NOT NULL,
  `kategori` varchar(50) DEFAULT NULL,
  `harga` decimal(10,2) NOT NULL,
  `stok` int(11) NOT NULL
) ;

--
-- Dumping data for table `barang`
--

INSERT INTO `barang` (`barang_id`, `nama_barang`, `kategori`, `harga`, `stok`) VALUES
('BRG001', 'Kursi Kayu Jati Premium', 'Kursi', 250000.00, 20),
('BRG002', 'Meja Makan Minimalis', 'Meja', 1200000.00, 5),
('BRG003', 'Lemari Pakaian 2 Pintu', 'Lemari', 1500000.00, 3),
('BRG004', 'Sofa Ruang Tamu 3 Seater', 'Sofa', 3500000.00, 2),
('BRG005', 'Meja Rias Modern', 'Meja', 850000.00, 4),
('BRG006', 'Wajan Teflon Anti Lengket 24cm', 'Dapur', 150000.00, 15),
('BRG007', 'Panci Set Stainless Steel (Isi 5)', 'Dapur', 350000.00, 10),
('BRG008', 'Sapu Lantai Nilon Premium', 'Kebersihan', 25000.00, 30),
('BRG009', 'Alat Pel Putar (Spin Mop) + Ember', 'Kebersihan', 120000.00, 20),
('BRG010', 'Rak Piring Minimalis 2 Tingkat', 'Dapur', 85000.00, 12),
('BRG011', 'Jemuran Baju Aluminium Lipat', 'Laundry', 250000.00, 8),
('BRG012', 'Setrika Listrik Anti Lengket', 'Elektronik', 300000.00, 15),
('BRG013', 'Blender Kaca Multifungsi 2L', 'Elektronik', 450000.00, 10),
('BRG014', 'Tempat Sampah Injak 15 Liter', 'Kebersihan', 65000.00, 25),
('BRG015', 'Keset Kaki Microfiber Anti Slip', 'Dekorasi', 35000.00, 40),
('BRG016', 'Keranjang Baju Kotor Lipat', 'Laundry', 45000.00, 20),
('BRG017', 'Gantungan Baju (Hanger) 1 Lusin', 'Laundry', 20000.00, 50),
('BRG018', 'Sikat Kamar Mandi Gagang Panjang', 'Kebersihan', 15000.00, 35),
('BRG019', 'Dispenser Air Galon Bawah', 'Elektronik', 1500000.00, 4),
('BRG020', 'Kotak Penyimpanan Serbaguna (Box)', 'Organizer', 75000.00, 18);

-- --------------------------------------------------------

--
-- Table structure for table `detail_transaksi`
--

CREATE TABLE `detail_transaksi` (
  `detail_id` varchar(15) NOT NULL,
  `transaksi_id` varchar(15) NOT NULL,
  `barang_id` varchar(10) NOT NULL,
  `jumlah_barang` int(11) NOT NULL,
  `harga_satuan` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `detail_transaksi`
--

INSERT INTO `detail_transaksi` (`detail_id`, `transaksi_id`, `barang_id`, `jumlah_barang`, `harga_satuan`, `subtotal`) VALUES
('DTL-00001', 'TRX-260511-001', 'BRG001', 1, 250000.00, 250000.00),
('DTL-00002', 'TRX-260511-002', 'BRG001', 1, 250000.00, 250000.00),
('DTL-00003', 'TRX-260511-002', 'BRG002', 1, 1200000.00, 1200000.00);

-- --------------------------------------------------------

--
-- Table structure for table `pelanggan`
--

CREATE TABLE `pelanggan` (
  `pelanggan_id` varchar(10) NOT NULL,
  `nama_pelanggan` varchar(100) NOT NULL,
  `nomor_telepon` varchar(20) DEFAULT NULL,
  `alamat` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pelanggan`
--

INSERT INTO `pelanggan` (`pelanggan_id`, `nama_pelanggan`, `nomor_telepon`, `alamat`) VALUES
('PLG001', 'Pelanggan Umum', '-', '-'),
('PLG002', 'Andi Setiawan', '081234567890', 'Jl. Lowokwaru, Malang'),
('PLG003', 'Siti Aminah', '085712345678', 'Jl. Sukarno Hatta, Malang');

-- --------------------------------------------------------

--
-- Table structure for table `resi`
--

CREATE TABLE `resi` (
  `resi_id` varchar(15) NOT NULL,
  `transaksi_id` varchar(15) NOT NULL,
  `nomor_resi` varchar(30) NOT NULL,
  `tanggal_cetak` datetime NOT NULL,
  `total_bayar` decimal(12,2) NOT NULL,
  `kembalian` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resi`
--

INSERT INTO `resi` (`resi_id`, `transaksi_id`, `nomor_resi`, `tanggal_cetak`, `total_bayar`, `kembalian`) VALUES
('RS001', 'TRX-260511-001', 'STRK-20260511-1001', '2026-05-11 10:01:00', 300000.00, 50000.00),
('RS002', 'TRX-260511-002', 'STRK-20260511-1131', '2026-05-11 11:31:00', 1500000.00, 50000.00);

-- --------------------------------------------------------

--
-- Table structure for table `transaksi`
--

CREATE TABLE `transaksi` (
  `transaksi_id` varchar(15) NOT NULL,
  `user_id` varchar(10) NOT NULL,
  `pelanggan_id` varchar(10) DEFAULT NULL,
  `tanggal_transaksi` datetime NOT NULL,
  `total_harga` decimal(12,2) NOT NULL,
  `metode_pembayaran` varchar(50) DEFAULT NULL,
  `status_transaksi` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaksi`
--

INSERT INTO `transaksi` (`transaksi_id`, `user_id`, `pelanggan_id`, `tanggal_transaksi`, `total_harga`, `metode_pembayaran`, `status_transaksi`) VALUES
('TRX-260511-001', 'U001', 'PLG001', '2026-05-11 10:00:00', 250000.00, 'Tunai', 'Sukses'),
('TRX-260511-002', 'U001', 'PLG002', '2026-05-11 11:30:00', 1450000.00, 'Tunai', 'Sukses');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` varchar(10) NOT NULL,
  `nama_user` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','kasir') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `nama_user`, `username`, `password`, `role`) VALUES
('U001', 'Budi Kasir', 'kasir1', '1234', 'kasir'),
('U002', 'Pak Bos', 'bos', 'admin', 'admin');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `barang`
--
ALTER TABLE `barang`
  ADD PRIMARY KEY (`barang_id`);

--
-- Indexes for table `detail_transaksi`
--
ALTER TABLE `detail_transaksi`
  ADD PRIMARY KEY (`detail_id`),
  ADD KEY `transaksi_id` (`transaksi_id`),
  ADD KEY `barang_id` (`barang_id`);

--
-- Indexes for table `pelanggan`
--
ALTER TABLE `pelanggan`
  ADD PRIMARY KEY (`pelanggan_id`);

--
-- Indexes for table `resi`
--
ALTER TABLE `resi`
  ADD PRIMARY KEY (`resi_id`),
  ADD UNIQUE KEY `transaksi_id` (`transaksi_id`),
  ADD UNIQUE KEY `nomor_resi` (`nomor_resi`);

--
-- Indexes for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD PRIMARY KEY (`transaksi_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `pelanggan_id` (`pelanggan_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `detail_transaksi`
--
ALTER TABLE `detail_transaksi`
  ADD CONSTRAINT `detail_transaksi_ibfk_1` FOREIGN KEY (`transaksi_id`) REFERENCES `transaksi` (`transaksi_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `detail_transaksi_ibfk_2` FOREIGN KEY (`barang_id`) REFERENCES `barang` (`barang_id`) ON UPDATE CASCADE;

--
-- Constraints for table `resi`
--
ALTER TABLE `resi`
  ADD CONSTRAINT `resi_ibfk_1` FOREIGN KEY (`transaksi_id`) REFERENCES `transaksi` (`transaksi_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD CONSTRAINT `transaksi_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `transaksi_ibfk_2` FOREIGN KEY (`pelanggan_id`) REFERENCES `pelanggan` (`pelanggan_id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
