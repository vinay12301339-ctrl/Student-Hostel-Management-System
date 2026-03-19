# 🏠 HostelHub - Student Hostel Management System

A comprehensive, production-ready student hostel management system with full-featured admin and student portals, AI-powered features, and modern architecture.

## ✨ Features

### 🎓 Student Portal
- **Dashboard** – Real-time overview with fee status, badges, quick actions
- **Room Booking** – Browse available rooms, book with approval workflow, view amenities
- **Fee Management** – View pending/paid fees, pay via UPI, Card, Wallet, Bank Transfer
- **Maintenance** – Report issues with AI-powered categorization and suggestions, real-time ticket tracking
- **Achievements** – Gamification with points, badges, hostel leaderboard
- **Digital ID Card** – Student identity card with room & profile details
- **Roommate Matching** – AI compatibility score-based roommate recommendations

### 👨‍💼 Admin Dashboard
- **Analytics** – Real-time occupancy stats, revenue charts, ticket metrics
- **Room Management** – Add/edit/delete rooms, track occupancy, manage status
- **Student Management** – View all students, approve/deactivate accounts
- **Booking Approvals** – Approve or reject room booking requests
- **Maintenance Operations** – Update ticket status, assign staff, track SLA breaches
- **Financial Reports** – Monthly revenue vs. billing, payment method breakdown

### 🚀 Creative Surprise Features
- 🤖 **AI Maintenance Assistant** – Auto-categorizes complaints and provides smart suggestions
- 🎮 **Gamification Engine** – Points, badges, leaderboard for positive behavior
- 💑 **Roommate Matching AI** – Compatibility scoring based on lifestyle preferences
- 📊 **SLA Dashboard** – Visual tracking with breach alerts for maintenance
- 🌿 **Eco-Warrior Tracking** – Sustainability badges for energy/water conservation

## 🛠️ Tech Stack

### Frontend
- **React 18** + TypeScript + Vite
- **Tailwind CSS** for styling
- **React Router v6** for navigation
- **Zustand** for global state
- **React Query** for server state + caching
- **React Hook Form** + Zod for forms
- **Recharts** for analytics charts

### Backend
- **Node.js** + Express.js + TypeScript
- **MongoDB** + Mongoose ODM
- **JWT** authentication (access + refresh tokens)
- **bcrypt** for password hashing
- **Helmet** + **cors** + **express-rate-limit** for security
- **Winston** for logging
- **Socket.io** ready for real-time features

### DevOps
- **Docker** multi-stage builds
- **Docker Compose** orchestration
- **GitHub Actions** CI/CD pipeline
- Health checks and structured logging

## 📁 Project Structure

```
├── frontend/               # React + TypeScript SPA
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   └── layout/     # Student & Admin layouts
│   │   ├── pages/          # Page components
│   │   │   ├── student/    # Dashboard, Rooms, Fees, Maintenance, etc.
│   │   │   └── admin/      # Dashboard, Rooms, Students, etc.
│   │   ├── utils/          # API client, Zustand store
│   │   └── styles/         # Global CSS with Tailwind
│   ├── Dockerfile
│   └── package.json
│
├── backend/                # Node.js + Express API
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── services/       # Business logic
│   │   └── utils/          # Logger, helpers
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml      # Full stack orchestration
├── .github/workflows/      # CI/CD pipelines
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Docker & Docker Compose (optional)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/vinay12301339-ctrl/Student-Hostel-Management-System.git
cd Student-Hostel-Management-System
```

2. **Backend setup**
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
npm install
npm run dev
```

3. **Frontend setup**
```bash
cd frontend
npm install
npm run dev
```

4. **Seed demo data** (optional)
```bash
cd backend
npm run seed
```

### Docker Deployment

```bash
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api/v1/health

### Demo Credentials

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@hostel.com       | admin123   |
| Student | student@hostel.com     | student123 |

## 📡 API Overview

| Endpoint                    | Description                       |
|-----------------------------|-----------------------------------|
| `POST /api/v1/auth/login`   | Login (returns JWT tokens)        |
| `POST /api/v1/auth/register` | Register new student             |
| `GET  /api/v1/students/dashboard` | Student dashboard data      |
| `GET  /api/v1/rooms`        | List available rooms              |
| `POST /api/v1/bookings`     | Create booking request            |
| `GET  /api/v1/fees/my`      | Student fee history               |
| `POST /api/v1/payments/process` | Process payment               |
| `POST /api/v1/maintenance`  | Submit maintenance ticket         |
| `GET  /api/v1/gamification/leaderboard` | Points leaderboard    |
| `GET  /api/v1/admin/dashboard` | Admin analytics overview       |

## 🔒 Security Features

- JWT with short-lived access tokens + refresh tokens
- Role-Based Access Control (student, admin, staff)
- bcrypt password hashing (cost factor 12)
- Rate limiting (100 req/15 min per IP)
- Helmet.js security headers
- CORS configuration
- Input validation with Mongoose schemas
- Non-root Docker containers

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend type-check
cd frontend && npx tsc --noEmit
```

## 📄 License

MIT License