# AtomQuest Portal

Employee Goal-Tracking Portal — Dockerized full-stack application with Node.js/Express backend, React frontend, PostgreSQL database, JWT authentication, RBAC, and a complete goal management workflow.

## Quick Start

```bash
docker compose up -d
```

Once all containers are running, open **http://localhost:3000**.

### Login Credentials

| Role     | Email                | Password      |
|----------|----------------------|---------------|
| Employee | emp1@test.com        | password123   |
| Manager  | mgr1@test.com        | password123   |
| Admin    | admin1@test.com      | password123   |

### Service URLs

| Service  | URL                            |
|----------|--------------------------------|
| Frontend | http://localhost:3000           |
| Backend  | http://localhost:5000/api/health|
| Database | localhost:5433 (postgres:change_me) |

## Features

- **Authentication & RBAC** — JWT-based login/register with 3 roles: employee, manager, admin
- **Goal Management** — Create goal sheets with 1-8 goals, real-time weightage validation (each ≥10%, sum=100%)
- **Manager Approval** — Submit draft goals, managers approve/reject with reason, sheets lock on approval
- **Admin Shared Goals** — Push organization-wide goals to multiple employees at once
- **Quarterly Achievements** — Log actuals per goal per quarter with auto-computed progress score
- **Manager Check-ins** — Provide feedback, confidence levels, and support flags per goal
- **Admin Dashboard** — Metrics dashboard with completion stats and phase progress
- **Audit Trail** — Full immutable audit log with date/action/user filters
- **Reports** — Export achievement data as CSV or JSON
- **Role-based UI** — Navbar adapts to role; employee views goals, manager approves + checks in, admin controls all

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Node.js, Express, Sequelize ORM     |
| Frontend   | React 18, React Router 6, Axios     |
| Styling    | Tailwind CSS 3                      |
| Database   | PostgreSQL 15                       |
| Auth       | JWT (7-day expiry), bcrypt          |
| Container  | Docker, Docker Compose              |

## Folder Structure

```
atomquest-portal/
├── backend/
│   ├── src/
│   │   ├── routes/        # 7 route files (auth, goals, manager, shared-goals, achievements, check-ins, admin)
│   │   ├── models/        # 7 Sequelize models (User, GoalSheet, Goal, Achievement, Cycle, CheckIn, AuditLog)
│   │   ├── middleware/     # authenticateToken, requireRole
│   │   ├── utils/         # progressScore formula
│   │   └── server.js      # Express entry point
│   ├── migrations/        # SQL schema + seed data
│   ├── seeds/             # Idempotent Sequelize seed runner
│   ├── tests/             # 6 test files (24 tests)
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios helpers (6 modules)
│   │   ├── pages/         # 13 page components
│   │   ├── components/    # Navbar, ProtectedRoute
│   │   ├── context/       # AuthContext
│   │   └── App.js         # React Router with role-based routing
│   ├── public/
│   ├── tests/             # 2 test files
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml     # 3 services: postgres, backend, frontend
├── .env.example
├── .gitignore
├── README.md
└── TESTING.md
```

## User Journeys

### Employee Flow
1. Login as emp1@test.com
2. Create goal sheet → add goals with weightages → submit for approval
3. View submitted sheet, wait for manager approval
4. Once approved, log quarterly achievements per goal
5. Track progress score on achievement page

### Manager Flow
1. Login as mgr1@test.com
2. View pending approvals → expand goals → approve or reject with reason
3. Create check-ins: select employee → goal → quarter → add feedback
4. View team check-ins filtered by quarter

### Admin Flow
1. Login as admin1@test.com
2. View dashboard metrics (phase completion, achievements)
3. Push shared goals to employees
4. Browse audit logs with date/action filters
5. Download achievement reports (CSV/JSON)
6. Unlock goal sheets if needed

## Test Results

### Backend (Jest — 24 tests)
```
PASS tests/auth.test.js
PASS tests/goals.test.js
PASS tests/manager.test.js
PASS tests/achievements.test.js
PASS tests/check-ins.test.js
PASS tests/admin.test.js
Test Suites: 6 passed, 6 total
Tests:       24 passed, 24 total
```

### Frontend (React Testing Library — 2 tests)
```
PASS src/__tests__/App.test.js
PASS src/__tests__/LoginPage.test.js
Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
```

## Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens expire after 7 days
- Role-based access control at middleware level
- CORS enabled for frontend origin
- Audit logging for all admin actions
- No secrets in source code (`.env` excluded from git)

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | None | Register new user |
| POST | /api/auth/login | None | Login, returns JWT |
| GET | /api/auth/me | Token | Current user profile |
| POST | /api/goals | Token | Create goal sheet |
| GET | /api/goals | Token | List goal sheets |
| PATCH | /api/goals/:id | Token | Update goal sheet |
| PATCH | /api/goals/:id/status | Token | Submit for approval |
| DELETE | /api/goals/:id | Token | Delete draft |
| GET | /api/manager/pending-approvals | Manager | List pending |
| PATCH | /api/manager/approve/:id | Manager | Approve sheet |
| PATCH | /api/manager/reject/:id | Manager | Reject sheet |
| POST | /api/admin/shared-goals | Admin | Push shared goals |
| GET | /api/admin/users | Admin | List all users |
| POST | /api/achievements | Token | Log achievement |
| GET | /api/achievements | Token | List achievements |
| POST | /api/check-ins | Manager | Create check-in |
| GET | /api/check-ins | Manager | List check-ins |
| GET | /api/admin/completion-dashboard | Admin | Dashboard metrics |
| GET | /api/admin/audit-logs | Admin | Audit trail |
| GET | /api/admin/reports/achievement | Admin | Export reports |
| PATCH | /api/admin/unlock-goal/:id | Admin | Unlock sheet |
| GET | /api/cycles | Token | List cycles |
