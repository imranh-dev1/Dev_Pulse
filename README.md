# DevPulse API

Internal Tech Issue & Feature Tracker API built with Node.js, Express.js, TypeScript, PostgreSQL, Raw SQL, JWT Authentication, and Role-Based Authorization.

---

## 🚀 Live URL

Backend URL here:

```bash
https://live-api-url.com
```

---

## 📂 GitHub Repository

GitHub repository link here:

```bash
https://github.com/imranh-dev1/Dev_Pulse
```

---

# 📌 Features

* User Registration & Login
* JWT Authentication
* Role-Based Authorization
* Create Issues
* Get All Issues
* Get Single Issue
* Update Issues
* Delete Issues
* Maintainer & Contributor Permission System
* PostgreSQL Database Integration
* Raw SQL Queries
* Modular Architecture
* Secure Password Hashing using bcrypt

---

# 🛠️ Technology Stack

| Technology   | Usage               |
| ------------ | ------------------- |
| Node.js      | Runtime Environment |
| Express.js   | Backend Framework   |
| TypeScript   | Type Safety         |
| PostgreSQL   | Relational Database |
| pg           | PostgreSQL Driver   |
| bcrypt       | Password Hashing    |
| jsonwebtoken | JWT Authentication  |

---

# 📁 Project Structure

```bash
src/
│
├── app/
│   ├── config/
│   ├── db/
│   ├── middleware/
│   ├── modules/
│   │   ├── auth/
│   │   └── issues/
│   └── utils/
│
├── app.ts
└── server.ts
```

---

# ⚙️ Environment Variables

Create a `.env` file in the root directory and add:

```env
PORT=5000

CONNECTION_STRING=your_connection_string

JWT_SECRET=your_secret_key
```

---

# 📦 Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/imranh-dev1/Dev_Pulse.git
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Run Development Server

```bash
npm run dev
```

---

# 🗄️ Database Schema

---

## Users Table

| Field      | Type                |
| ---------- | ------------------- |
| id         | SERIAL PRIMARY KEY  |
| name       | VARCHAR(255)        |
| email      | VARCHAR(255) UNIQUE |
| password   | TEXT                |
| role       | VARCHAR(20)         |
| created_at | TIMESTAMP           |
| updated_at | TIMESTAMP           |

---

## Issues Table

| Field       | Type               |
| ----------- | ------------------ |
| id          | SERIAL PRIMARY KEY |
| title       | VARCHAR(150)       |
| description | TEXT               |
| type        | VARCHAR(30)        |
| status      | VARCHAR(30)        |
| reporter_id | INTEGER            |
| created_at  | TIMESTAMP          |
| updated_at  | TIMESTAMP          |

---

# 🔐 Authentication System

* JWT-based Authentication
* Protected Routes
* Role-Based Access Control
* Secure Password Hashing using bcrypt

---

# 🌐 API Endpoints

---

## 🔹 Auth Routes

### Register User

```http
POST /api/auth/signup
```

### Login User

```http
POST /api/auth/login
```

---

## 🔹 Issues Routes

### Create Issue

```http
POST /api/issues
```

### Get All Issues

```http
GET /api/issues
```

### Get Single Issue

```http
GET /api/issues/:id
```

### Update Issue

```http
PATCH /api/issues/:id
```

### Delete Issue

```http
DELETE /api/issues/:id
```

---

# 🔑 Role Permissions

| Role        | Permissions          |
| ----------- | -------------------- |
| contributor | Create & View Issues |
| maintainer  | Full Access          |

---

# 📌 Query Parameters

## Get All Issues

```http
GET /api/issues?sort=newest&type=bug&status=open
```

| Param  | Values                      |
| ------ | --------------------------- |
| sort   | newest, oldest              |
| type   | bug, feature_request        |
| status | open, in_progress, resolved |

---

# 🧪 Sample User Credentials

## Contributor

```json
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
}
```

## Maintainer

```json
{
  "email": "jobaer@gmail.com",
  "password": "jobaer"
}
```

# 🔒 Authorization Rules

## Contributor

* Create Issues
* View Issues
* Update Own Issue (Only if status is open)

## Maintainer

* Update Any Issue
* Delete Any Issue
* Full System Access

---

# 🚀 Deployment

* Backend Deployment: Vercel
* Database Hosting: NeonDB

---

# 👨‍💻 Author

Imran Hossain
imranh.dev1@gmail.com
