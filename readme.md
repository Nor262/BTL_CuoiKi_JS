# 🎌 MyAnimeList - Website quản lý danh sách Anime cá nhân

> Một dự án cá nhân giúp người dùng đăng ký, đăng nhập và quản lý danh sách Anime yêu thích (Watchlist) qua giao diện lấy cảm hứng từ Netflix.

---

## 📌 Giới thiệu

MyAnimeList là một website cá nhân hóa cho phép người dùng:

- Tạo tài khoản và đăng nhập
- Thêm/bớt Anime vào danh sách cá nhân (watchlist)
- Xem danh sách Anime đã lưu
- Tìm kiếm và xem thông tin Anime từ Jikan API
- Giao diện người dùng lấy cảm hứng từ Netflix

✅ Hướng đến mục tiêu thực hành kỹ năng **Full-Stack Web Development** và xây dựng sản phẩm có thể thêm vào Portfolio cá nhân.

---

## 🌟 Tính năng chính

- Đăng ký/Đăng nhập người dùng
- Bảo lưu thông tin đăng nhập (localStorage)
- Thêm/Xóa Anime vào Watchlist
- Xem danh sách Watchlist cá nhân
- Xóa toàn bộ Watchlist
- Tìm kiếm Anime theo tên/thể loại
- Hiển thị chi tiết thông tin Anime

---

## 🏗️ Kiến trúc hệ thống

- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** Node.js + Express
- **Database:** MySQL
- **API Anime:** Jikan API (https://jikan.moe)

---

## ⚙️ Công nghệ sử dụng

- HTML/CSS/JavaScript
- Node.js
- Express
- MySQL (mysql2)
- Jikan REST API
- Visual Studio Code
- MySQL Workbench

---

## 📥 Hướng dẫn cài đặt

### 1️⃣ Clone dự án

```bash
git clone https://github.com/Nor262/BTL_CuoiKi_JS.git
cd BTL_CuoiKi_JS
```

### 2️⃣ Cài đặt dependencies (server)

```bash
cd backend
npm install
```

### 3️⃣ Tạo CSDL

```sql
CREATE DATABASE anime_db;

CREATE TABLE users (
  username VARCHAR(50) PRIMARY KEY,
  password VARCHAR(100) NOT NULL
);

CREATE TABLE watchlist (
  username VARCHAR(50),
  mal_id INT,
  title VARCHAR(255),
  image_url TEXT,
  score FLOAT,
  PRIMARY KEY(username, mal_id),
  FOREIGN KEY (username) REFERENCES users(username)
);
```

### 4️⃣ Chạy server

```bash
npm run dev
```

### 5️⃣ Mở frontend

Mở file `index.html` trong trình duyệt.

---

## 🧭 Cách sử dụng

- Đăng ký tài khoản mới
- Đăng nhập
- Duyệt danh sách Anime (qua tìm kiếm)
- Thêm/Xóa Anime khỏi Watchlist
- Xem Watchlist cá nhân
