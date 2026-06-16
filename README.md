---

# 💸 BillSplit – Smart Expense Sharing App

BillSplit is a full-stack web application that helps users split expenses, manage groups, track balances, and settle payments easily. It is inspired by apps like Splitwise, built with a modern MERN stack.

---

## 📁 **Project Structure**

This repository contains two main folders at the root:

`client/` — Frontend React application
`server/` — Backend Node.js/Express API

```

bill-split/
├── client/              # Frontend (React)
│   └── src/
│       ├── pages/
│       ├── components/
│       └── assets/
│
├── server/              # Backend (Node + Express)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── config/
│
└── README.md
```
---

## 🚀 **Getting Started**

### Prerequisites

Node.js
npm

---

## ⚙️ **Setup Instructions**

### 1. Clone Repository

```bash
git clone https://github.com/your-username/billsplit-project.git
cd billsplit-project
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/billsplit
JWT_secret=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Run backend:

```bash
npm start
```

---

### 3. Frontend Setup

```bash
cd client
npm install
npm start
```

---

## ✨ **Features**

### 🔐 Authentication

Email + Password login
Google OAuth login
JWT-based authentication
Forgot Password with email reset link
Secure password reset flow (token-based)

---

### 👥 Friends System

Add and manage friends
View friend list with profile details

---

### 🧾 Group Expense Management

Create groups
Add members to groups
Add expenses within groups
Automatic balance calculation
See who owes whom

---

### 💰 Expense Tracking

Split expenses equally
Category-wise expense tracking
Per-group balance breakdown
Real-time updates

---

### 📊 Dashboard

Overview of groups
Recent activity feed
Quick navigation to groups & friends

---

### 🖼️ Profile

Update profile info
Upload profile picture

---

## 🔑 **Authentication Flow**

User registers or logs in
Server generates JWT token
Token stored in localStorage
Protected routes use token validation
Forgot password sends email reset link
Reset password updates hashed password

---

## 📧 **Forgot Password Flow**

User enters email
Server generates reset token
Email sent via Nodemailer (Gmail SMTP)
User clicks link → redirected to reset page
New password is saved securely (bcrypt hashed)

---

## 🧠 **Tech Stack**

### Frontend

React.js
React Router DOM
Tailwind CSS
Context API / Hooks
Fetch API

### Backend

Node.js
Express.js
MongoDB + Mongoose
JWT Authentication
bcrypt.js
Nodemailer (for email service)
Passport.js (Google OAuth)

---

