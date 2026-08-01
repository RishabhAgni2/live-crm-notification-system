# 🔔 Live CRM Notification System

A CRM-style application that allows admins to manage companies and contacts, assign them to users with specific roles, and deliver **real-time notifications** the instant an assignment happens. Built as a full-stack internship assignment demonstrating real-time systems, background job processing, and clean API design.

## 📋 Overview

Live CRM Notification System solves a common product problem: keeping users instantly informed when work is assigned to them. Admins can create companies and contacts, assign ownership/roles to team members, and the assigned user receives a live notification the moment it happens — no page refresh required.

The system is built with a production-style architecture: a React frontend, an Express + Prisma backend backed by PostgreSQL, Socket.IO for real-time delivery, and a Bull/Redis-powered background worker that generates notifications independently of user actions.

This project was built to showcase practical engineering decisions — relational data modeling, authenticated APIs, real-time event delivery, and asynchronous background processing — within a scoped, reviewable codebase.

## ✨ Features

**Authentication**
- JWT-based login and registration
- Role-based access (Admin / User)

**CRM**
- Create and manage companies
- Create and manage contacts linked to companies
- Assign companies/contacts to users with a defined role

**Notifications**
- Instant, user-specific real-time notifications on assignment
- Persistent notification history stored in the database
- Unread notification indicator
- Mark individual or all notifications as read

**Background Processing**
- Independent worker process that generates notifications outside the request/response cycle
- Queue-based job processing using Bull + Redis

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Frontend | React, Vite |
| Database | PostgreSQL (Neon) via Prisma ORM |
| Realtime | Socket.IO |
| Queue | Bull Queue + Redis |
| Auth | JWT |
| Deployment | Vercel (frontend), Render (backend) |

## 📁 Project Structure

```
crm-notification-system/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── queues/
│   │   ├── server.js
│   │   └── worker.js
│   └── prisma/
│       ├── schema.prisma
│       └── seed.js
└── frontend/
    └── src/
        ├── pages/
        ├── components/
        └── context/
```

## 🚀 Live Demo

- **Frontend:** https://live-crm-notification-system-seven.vercel.app/login
- **Backend API:** https://live-crm-notification-system.onrender.com

## 🔐 Environment Variables

**Backend**
```
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
CORS_ORIGIN=
```

**Frontend**
```
VITE_API_URL=
```

## 💻 Local Setup

**Backend**
```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
npm run seed
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## 🔑 Demo Credentials

| Role  | Email          | Password  |
|-------|----------------|-----------|
| Admin | admin@crm.com  | admin123  |
| User  | user@crm.com   | user123   |

> Demo users are auto-created via the Prisma seed script (`npm run seed`).

## 🎬 Demo Flow

```
Admin Login
   ↓
Create Company
   ↓
Create Contact
   ↓
Assign Company/Contact to a User
   ↓
Assigned User instantly receives a notification
   ↓
Notification appears in the Notification Center
   ↓
User marks notification as Read
   ↓
Background Worker creates another notification
```

## 📡 API Summary

| Group | Description |
|---|---|
| Authentication | Login, registration |
| Companies | CRUD operations for companies |
| Contacts | CRUD operations for contacts |
| Assignments | Assign companies/contacts to users |
| Notifications | Fetch, read, mark-as-read operations |
| Users | List users for assignment |

## 📌 Assumptions

- Roles are limited to `ADMIN` and `USER` for simplicity.
- Assignment roles (e.g. "Account Owner") are free-text rather than a fixed enum.
- Authentication is intentionally minimal (no password reset/email verification) to keep scope focused on the core assignment.

## 🏗️ Architecture

```
React (Frontend)
      ↓
Express API
      ↓
Prisma ORM
      ↓
PostgreSQL

Socket.IO  ───────────►  Frontend (Live Updates)

Bull Queue ───────────►  Background Notification Worker
```

## 📝 Notes

- The backend exposes a few additional REST APIs beyond the frontend workflow (e.g. user registration and utility endpoints). These are intentionally not linked from the UI, as the assignment focuses on the core CRM and notification flow. They can be tested independently using Postman.
- The Bull background worker is fully implemented. Due to Render's free-tier limitations, only the API service is deployed online. The worker can be run locally with:
  ```bash
  npm run start:worker
  ```