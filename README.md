# Assignment Submission Management System

A full-stack, role-based web application for managing academic assignments and student submissions. The system supports three distinct roles — **Admin**, **Teacher**, and **Student** — each with clearly defined responsibilities and access controls.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Main Features](#main-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Assumptions](#assumptions)
- [Known Limitations](#known-limitations)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
  - [Backend (ASP.NET Core API)](#backend-aspnet-core-api)
  - [Frontend (Next.js)](#frontend-nextjs)
  - [Running with Docker](#running-with-docker)
- [Running the Tests](#running-the-tests)
- [API Documentation](#api-documentation)

---

## Project Overview

The **Assignment Submission Management System** is designed to streamline the complete lifecycle of academic assignments — from creation and publishing by teachers, through student submission, to grading and feedback. The platform provides a centralised interface for administrators to manage users, classes, subjects, and system settings, while ensuring strict role-based access at every layer.

---

## Main Features

### 👤 Admin
- Create and manage user accounts (Admin, Teacher, Student)
- Define and manage Classes and Subjects
- Assign teachers to class-subject combinations (TeacherClassSubjects)
- Configure global system settings (e.g., allow/disallow late submissions)
- View all assignments and submissions across the system
- Delete users, classes, subjects, and assignments

### 👨‍🏫 Teacher
- Create, edit, publish, and delete assignments for assigned class-subjects
- View all submissions for their assignments
- Grade submissions with marks and written feedback
- Update submission statuses

### 🎓 Student
- View published assignments for enrolled classes
- Submit answers for assignments
- Update submissions (if resubmission is allowed)
- View personal submission history and grades

### 🔐 Authentication & Security
- JWT Bearer token authentication
- Role-based authorization on every endpoint
- Password policy enforcement (min. 6 chars, uppercase, lowercase, digit required)
- Deactivated account detection on login

---

## Technology Stack

### Backend
| Component       | Technology                                |
|----------------|-------------------------------------------|
| Framework       | ASP.NET Core 8.0 (Web API)                |
| ORM             | Entity Framework Core 8.0                 |
| Database        | PostgreSQL 16                             |
| Authentication  | ASP.NET Core Identity + JWT Bearer        |
| Documentation   | Swagger / OpenAPI (Swashbuckle)           |
| Unit Testing    | xUnit 2.6, Moq 4.20, EF Core InMemory    |

### Frontend
| Component       | Technology                                |
|----------------|-------------------------------------------|
| Framework       | Next.js 16.3 (App Router)                 |
| Language        | TypeScript                                |
| Styling         | Tailwind CSS v4                           |
| Icons           | Lucide React                              |
| HTTP Client     | Fetch API (via `lib/api.ts`)              |

### Infrastructure
| Component       | Technology                                |
|----------------|-------------------------------------------|
| Containerisation | Docker & Docker Compose                  |
| Environment Mgmt | `.env` file loading in ASP.NET Core      |

---

## Project Structure

```
Assignment_Submission_Management_System/
├── Assignment_Submission_Management_System_Backend/
│   ├── Assignment_Submission_Management_System_Backend/    # Main API project
│   │   ├── Core/
│   │   │   ├── Common/           # BaseEntity with timestamps
│   │   │   ├── Constants/        # Role constants (Admin, Teacher, Student)
│   │   │   ├── Entities/         # Domain entities
│   │   │   ├── Enums/            # AssignmentStatus, SubmissionStatus
│   │   │   ├── Exceptions/       # NotFoundException, ForbiddenException, BadRequestException
│   │   │   └── Interfaces/       # Service interfaces
│   │   ├── Infrastructure/
│   │   │   ├── Data/
│   │   │   │   ├── ApplicationDbContext.cs
│   │   │   │   ├── Configurations/   # EF Core entity configurations
│   │   │   │   ├── DbInitializer.cs  # Seeder for roles and admin user
│   │   │   │   └── Migrations/       # EF Core migrations
│   │   │   ├── Identity/         # JwtSettings, TokenService
│   │   │   └── Middleware/       # Global exception handling middleware
│   │   ├── Modules/              # Feature modules (vertical slice)
│   │   │   ├── Auth/             # Login, Register
│   │   │   ├── Assignments/      # CRUD + Publish
│   │   │   ├── Classes/          # Class management
│   │   │   ├── Settings/         # System-wide AppSettings
│   │   │   ├── Subjects/         # Subject management
│   │   │   ├── Submissions/      # Submit, Update, Grade
│   │   │   ├── TeacherClassSubjects/ # Teacher-class-subject assignment
│   │   │   └── Users/            # User management
│   │   ├── Shared/               # Extension methods, service registration
│   │   ├── .env                  # Local environment variables (not committed)
│   │   ├── .env.example          # Environment variable template
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   └── Program.cs
│   ├── Assignment_Submission_Management_System_Backend.Tests/
│   │   ├── Helpers/              # TestDbContextFactory, MockHelpers
│   │   └── Services/             # Unit tests for all services
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .env                      # Docker-level environment variables
│   └── .env.example
│
└── assignment_submission_management_system_frontend/
    ├── app/
    │   ├── page.tsx              # Public landing page
    │   ├── login/                # Login page
    │   ├── register/             # Self-registration page
    │   ├── dashboard/            # Role-aware dashboard
    │   ├── users/                # Admin: user management
    │   ├── classes/              # Admin: class management
    │   ├── subjects/             # Admin: subject management
    │   ├── teacher-class-subjects/ # Admin: teacher assignments
    │   ├── assignments/          # Teacher/Student: assignment management
    │   ├── submissions/          # Teacher/Student: submission management
    │   └── settings/             # Admin: system settings
    ├── components/
    │   ├── layout/               # Sidebar, Header, AppLayout
    │   └── ui/                   # Card, Modal, FormInput, Toast, etc.
    ├── context/                  # AuthContext, ToastContext
    ├── lib/                      # api.ts (all API calls)
    ├── types/                    # TypeScript API DTOs
    ├── Dockerfile
    ├── docker-compose.yml
    ├── .env.example
    └── next.config.ts
```

---

## Assumptions

1. **Admin-only registration**: New user accounts (Teacher, Student, Admin) can only be created by an authenticated Admin. The self-registration page (`/register`) is available but intended for initial setup or is restricted by convention.
2. **Single role per user**: Each user is assigned exactly one role (Admin, Teacher, or Student) at registration; role changes require admin intervention.
3. **One teacher per class-subject**: Each class-subject combination may only be assigned to one teacher at a time. Reassignment requires deleting the existing record first.
4. **Enrollment is active**: Student class enrollment is managed separately; a student can only see and submit assignments for classes where `IsActive = true` in their enrollment record.
5. **Late submission policy**: Whether late submissions are accepted is controlled globally via the `AllowLateSubmissions` AppSetting key (set to `"true"` or `"false"`).
6. **Assignment lifecycle**: Assignments are created in `Draft` status and must be explicitly published by the responsible teacher (or Admin) to become visible to students.
7. **Seeded admin account**: On first application startup, a default Admin account is automatically seeded into the database.
8. **HTTPS not enforced in Docker**: The backend container runs over HTTP inside Docker. HTTPS redirection is disabled in containerised environments.

---

## Known Limitations

1. **No file upload support**: Assignment submissions are text/answer-based only. File attachment uploads are not implemented.
2. **No real-time notifications**: There is no WebSocket or SignalR integration; students and teachers must refresh pages to see new assignments or grades.
3. **No pagination**: List endpoints (assignments, submissions, users) return all records without server-side pagination. This may cause performance issues with large datasets.
4. **No email verification**: User emails are marked as confirmed at registration without any email verification flow.
5. **No password reset**: There is no "Forgot Password" / password reset mechanism.
6. **Single admin seed**: Only one admin account (`admin@school.com`) is seeded on startup; creating additional admins requires manual admin registration via the API.
7. **No student self-enrollment**: Students cannot enroll themselves in classes; enrollment must be managed directly in the database or via a future admin endpoint.
8. **JWT token blacklisting not implemented**: Logged-out tokens remain valid until their expiry time.

---

## Setup Instructions

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/) and npm
- [PostgreSQL 16](https://www.postgresql.org/download/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) *(for containerised setup)*
- [EF Core CLI tools](https://learn.microsoft.com/en-us/ef/core/cli/dotnet): `dotnet tool install --global dotnet-ef`

---

### Environment Variables

#### Backend

Copy the example file and fill in your values:

```bash
cd Assignment_Submission_Management_System_Backend/Assignment_Submission_Management_System_Backend
cp .env.example .env
```

Edit `.env`:

```env
# Database Credentials
DB_HOST=localhost
DB_PORT=5432
DB_NAME=AssignmentSubmissionDb
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

# JWT Settings
JWT_SECRET=YourSuperSecretKeyForJWTTokenGenerationMustBeAtLeast32Characters!
JWT_ISSUER=AssignmentSubmissionApi
JWT_AUDIENCE=AssignmentSubmissionClient
JWT_EXPIRY_MINUTES=60
```

> **Note:** `JWT_SECRET` must be at least 32 characters long.

#### Frontend

```bash
cd assignment_submission_management_system_frontend
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://localhost:7051
```

---

### Database Setup

Ensure PostgreSQL is running, then apply the EF Core migration:

```bash
cd Assignment_Submission_Management_System_Backend/Assignment_Submission_Management_System_Backend
dotnet ef database update
```

This applies the `InitialCreate` migration which creates all tables:
`AspNetUsers`, `AspNetRoles`, `Classes`, `Subjects`, `TeacherClassSubjects`, `StudentEnrollments`, `Assignments`, `Submissions`, `AppSettings`.

On first application run, `DbInitializer.SeedAsync` automatically seeds:
- Three roles: `Admin`, `Teacher`, `Student`
- Default admin account:
  - **Email:** `admin@school.com`
  - **Password:** `Admin@123`

---

## Running the Application

### Backend (ASP.NET Core API)

```bash
cd Assignment_Submission_Management_System_Backend/Assignment_Submission_Management_System_Backend
dotnet run
```

The API will be available at:
- **HTTP:** `http://localhost:5148`
- **HTTPS:** `https://localhost:7051`
- **Swagger UI:** `https://localhost:7051/swagger`

---

### Frontend (Next.js)

```bash
cd assignment_submission_management_system_frontend
npm install
npm run dev
```

The frontend will be available at: **`http://localhost:3000`**

---

### Running with Docker

The backend (API + PostgreSQL) and frontend each have their own `docker-compose.yml`.

#### Step 1 — Start Backend & Database

```bash
cd Assignment_Submission_Management_System_Backend

# Copy and configure environment
cp .env.example .env
# Edit .env with your credentials

docker compose up -d --build
```

Services started:
- `asms-postgres` — PostgreSQL 16 on port `5432`
- `asms-backend` — ASP.NET Core API on port `7051`

#### Step 2 — Start Frontend

```bash
cd assignment_submission_management_system_frontend

# Copy and configure environment
cp .env.example .env.local
# Set NEXT_PUBLIC_API_BASE_URL=http://localhost:7051

docker compose up -d --build
```

Services started:
- `asms-frontend` — Next.js on port `3000`

> **Note:** Start the backend first. The frontend `docker-compose.yml` connects to the pre-created `asms-network` bridge network.

#### Stopping Services

```bash
# Backend
cd Assignment_Submission_Management_System_Backend
docker compose down

# Frontend
cd assignment_submission_management_system_frontend
docker compose down
```

---

## Running the Tests

The backend unit tests use **xUnit**, **Moq**, and **EF Core InMemory** — no database connection required.

```bash
cd Assignment_Submission_Management_System_Backend
dotnet test Assignment_Submission_Management_System_Backend.Tests/Assignment_Submission_Management_System_Backend.Tests.csproj
```

### Test Coverage (28 Tests)

| Test Class                         | Tests | Coverage Area                                              |
|------------------------------------|-------|------------------------------------------------------------|
| `AuthServiceTests`                 | 6     | Login, registration, invalid role, deactivated user, JWT   |
| `AssignmentServiceTests`           | 7     | Create, publish, delete, visibility, deadline, authorization |
| `SubmissionServiceTests`           | 12    | Submit, resubmit, late policy, duplicate, grading, authorization |
| `TeacherClassSubjectServiceTests`  | 3     | Assign teacher, duplicate mapping, role validation         |

---

## API Documentation

When the backend is running, the interactive Swagger UI is accessible at:

**`https://localhost:7051/swagger`**

### Endpoint Summary

| Module                   | Endpoints                                                   |
|--------------------------|-------------------------------------------------------------|
| **Auth**                 | `POST /api/auth/login`, `POST /api/auth/register`           |
| **Users**                | `GET`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}`             |
| **Classes**              | `GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`     |
| **Subjects**             | `GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`     |
| **TeacherClassSubjects** | `GET`, `GET /{id}`, `POST`, `DELETE /{id}`                  |
| **Assignments**          | `GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`, `PATCH /{id}/publish` |
| **Submissions**          | `GET`, `GET /{id}`, `POST`, `PUT /{id}`, `PATCH /{id}/grade`, `PATCH /{id}/status` |
| **Settings**             | `GET`, `PUT /{key}`                                         |

All protected endpoints require a `Bearer <token>` header obtained from the login endpoint.
