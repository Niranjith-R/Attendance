# Student Attendance Management System

A full-stack web application for managing student attendance, built with React, TailwindCSS, Node.js, and MongoDB Atlas.

## Features

- **Dashboard** — Overview stats, today's attendance summary, and recent activity
- **Class Management** — Create, edit, and delete classes with sections and academic years
- **Student Management** — Add, edit, and remove students; search and filter by class
- **Mark Attendance** — Bulk mark daily attendance (present / absent / late) for a class
- **Attendance Records** — Filter by class, student, and date range; view per-student reports with attendance percentage

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 19, TailwindCSS 4, React Router |
| Backend  | Node.js, Express, Mongoose          |
| Database | MongoDB Atlas                       |

## Project Structure

```
├── client/          # React frontend (Vite)
│   └── src/
│       ├── api/         # API client
│       ├── components/  # Reusable UI components
│       └── pages/       # Route pages
└── server/          # Node.js backend
    └── src/
        ├── models/      # Mongoose schemas
        └── routes/      # Express API routes
```

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)

## Setup

### 1. MongoDB Atlas

1. Create a cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write access
3. Whitelist your IP address (or `0.0.0.0/0` for development)
4. Copy your connection string

### 2. Backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and set your MongoDB connection string:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/attendance_db?retryWrites=true&w=majority
```

Start the server:

```bash
npm install
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Frontend

In a new terminal:

```bash
cd client
npm install
npm run dev
```

The app runs at `http://localhost:5173`. API requests are proxied to the backend automatically.

## API Endpoints

| Method | Endpoint                              | Description                    |
|--------|---------------------------------------|--------------------------------|
| GET    | `/api/health`                         | Health check                   |
| GET    | `/api/dashboard/stats`                | Dashboard statistics           |
| GET    | `/api/dashboard/recent`               | Recent attendance records      |
| GET    | `/api/classes`                        | List all classes               |
| POST   | `/api/classes`                        | Create a class                 |
| GET    | `/api/students`                       | List students (filter/search)  |
| POST   | `/api/students`                       | Create a student               |
| GET    | `/api/attendance/class/:id/date/:date`| Get class attendance for date  |
| POST   | `/api/attendance/bulk`                | Save bulk attendance           |
| GET    | `/api/attendance/report/:studentId`   | Student attendance report      |

## Usage Flow

1. **Create classes** — Go to Classes and add your class sections
2. **Add students** — Go to Students and enroll students into classes
3. **Mark attendance** — Select a class and date, then mark each student
4. **View records** — Filter attendance history and generate student reports

## Production Build

```bash
# Frontend
cd client && npm run build

# Backend
cd server && npm start
```

Serve the `client/dist` folder with any static file server, or configure Express to serve it.
