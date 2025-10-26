# 📊 Data Visualization Dashboard

A full-stack web application for uploading, visualizing, and managing datasets with secure user authentication.
Built with **React (Vite)**, **FastAPI**, and **Supabase** providing an interactive dashboard for data analysis.

---

## Project Overview

The **Data Visualization Dashboard** enables users to:

* Upload CSV or Excel files
* View uploaded data in an interactive table
* Visualize data through dynamic charts (bar, line, pie, etc.)
* Apply filters and searches to dynamically update tables and charts
* Manage data securely via authenticated user accounts

---

## Features

* Secure **Signup & Login** (JWT authentication via FastAPI)
* Upload and parse CSV/Excel files
* Store parsed data securely in a Supabase PostgreSQL database
* View uploaded data in a **sortable, searchable, paginated table**
* Generate **interactive charts** (Bar, Line, Pie)
* Apply filters that update both the table and charts dynamically
* Light/Dark mode toggle (ShadCN + Tailwind) — *(bonus feature)*
* Role-based access control (`Admin` / `Member`) — *(bonus feature)*

---

## Tech Stack

| Layer          | Technology                 | Description                                      |
| -------------- | -------------------------- | ------------------------------------------------ |
| **Frontend**   | React + Vite               | Responsive, interactive dashboard UI             |
| **UI Library** | ShadCN/UI + Tailwind CSS   | Prebuilt modern, accessible components           |
| **Charts**     | Recharts                   | Interactive data visualization                   |
| **Backend**    | FastAPI (Python)           | RESTful API, authentication, and data processing |
| **Database**   | Supabase (PostgreSQL)      | Persistent data and file storage                 |
| **Auth**       | FastAPI + JWT              | Secure signup, login, and protected routes       |
| **Storage**    | Supabase Storage           | File uploads (Excel/CSV)                         |

---

## Folder Structure

### **Frontend (`/frontend`)**

```
frontend/
├── src/
│   ├── api/axiosInstance.js  # Centralized Axios config
│   ├── components/           # Reusable UI components (Navbar, Charts, etc.) 
│   ├── pages/                # Main pages (Login, Dashboard, Profile)
│   ├── store/                # Redux store
│   ├── App.jsx               # App entry point
│   └── main.jsx
└── package.json
```

### **Backend (`/backend`)**

```
backend/
├── app/
│   ├── main.py                  # FastAPI app entry point
│   ├── core/
│   │   ├── security.py          # JWT + password hashing
│   │   └── supabase_client.py   # Supabase client logic
│   ├── routes/
│   │   ├── auth.py              # Signup & login routes
│   │   ├── datasets.py          # Data upload, filter, visualize
├── .env                         # env variables
├── requirements.txt             # Dependencies
```

---

## Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/yourusername/data-visualization-dashboard.git
cd data-visualization-dashboard
```

---

### 2️⃣ Setup the Backend (FastAPI)

#### Navigate to backend directory

```bash
cd backend
```

#### Create virtual environment

```bash
python -m venv venv
source venv/bin/activate      # macOS/Linux
venv\Scripts\activate         # Windows
```

#### Install dependencies

```bash
pip install -r requirements.txt
```

#### Configure environment variables

Create a `.env` file in `/backend`:

```
SUPABASE_URL=postgresql+asyncpg://user:password@host:port/dbname
SUPABASE_SERVICE_KEY=your_supbase_service_key
SECRET_KEY=your_secret_key
```

#### Initialize database

```bash
python -m app.init_db
```

#### Run FastAPI server

```bash
uvicorn app.main:app --reload
```

Server will start at:
[http://localhost:8000](http://localhost:8000)

---

### 3️⃣ Setup the Frontend (React + Vite)

#### Navigate to frontend directory

```bash
cd frontend
```

#### Install dependencies

```bash
npm install
```

#### Run the app

```bash
npm run dev
```

Frontend will run at:
[http://localhost:5173](http://localhost:5173)

---

## Authentication Flow (FastAPI + JWT)

| Step                 | Description                                                                         |
| -------------------- | ----------------------------------------------------------------------------------- |
| **Signup**           | User registers via `/auth/signup`; FastAPI hashes password & stores user in DB.     |
| **Login**            | FastAPI validates credentials and issues a JWT token.                               |
| **Frontend**         | JWT is stored and used in `Authorization: Bearer <token>` header.                   |
| **Protected Routes** | FastAPI validates JWT before granting access.                                       |

---

## Data Visualization Features

* Upload CSV or Excel datasets
* Backend parses and stores data securely
* View in searchable, sortable tables
* Generate interactive Recharts (Bar, Line, Pie)
* Apply real-time column filters and search
* Dashboard updates charts and tables simultaneously

---

## Bonus Features

* **Light/Dark theme toggle** (ShadCN + Tailwind)
* **Role-based access control** (`Admin`, `Member`)
* **Dynamic charts** using Recharts
* **Type-safe APIs** using Pydantic and Axios

---

## Author

**Sarakshi More**
[LinkedIn](https://www.linkedin.com/in/sarakshi-m-158212211/)
[GitHub](https://github.com/sarakshimore/)

---
