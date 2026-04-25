# 🛋️ Toko Perabotan Bintang - POS & Management System

![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![VanillaJS](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## 📌 Tentang Proyek
Aplikasi berbasis **Client-Server** yang dirancang khusus untuk menangani proses operasional kasir (Point of Sales) dan manajemen inventori gudang pada Toko Perabotan Bintang. Proyek ini dibangun untuk memenuhi standar arsitektur RESTful API dengan performa tinggi.

## ✨ Fitur Utama
* **🛒 Interactive POS System:** Sistem kasir dengan fitur pencarian barang cerdas (Shortcut `/`), kalkulasi keranjang dinamis, dan cetak struk digital.
* **📊 Admin Dashboard:** Visualisasi data pendapatan 7 hari terakhir secara *real-time* menggunakan Chart.js dan pelacakan barang terlaris (*Fast Moving*).
* **📦 Inventory Management:** Fitur CRUD (Create, Read, Update, Delete) lengkap dengan proteksi *Foreign Key* dan notifikasi stok menipis.
* **🔒 Role-Based Access:** Pemisahan otorisasi yang aman antara akses Kasir dan Manajemen.

## 🛠️ Teknologi yang Digunakan
* **Backend:** GoLang dengan Framework Gin Gonic.
* **Database:** MySQL Relational Database (Terproteksi Stored Procedure).
* **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript (Fetch API).
* **UI/UX:** SweetAlert2 & Chart.js dengan dukungan *Dark Mode* terintegrasi.

## 📸 Cuplikan Layar (Screenshots)
*(Tambahkan screenshot UI Kasir dan Admin kamu di sini dengan cara mendrag-and-drop file gambar ke editor GitHub ini)*

## 🔗 Tautan Penting
* [🎥 Video Dokumentasi Proyek & Demo](MASUKKAN_LINK_YOUTUBE_ATAU_DRIVE_DI_SINI)
* [📑 Dokumentasi REST API (Postman)](MASUKKAN_LINK_POSTMAN_DI_SINI)

## 🚀 Cara Menjalankan Secara Lokal
1. Clone repository ini: `git clone https://github.com/username-kamu/nama-repo-kamu.git`
2. Jalankan database MySQL (XAMPP/MAMP) dan *import* skema database.
3. Buka terminal di folder proyek dan jalankan server:
   ```bash
   go run main.go
