tesing

# CRM & Project Management Backend

Production-grade REST API for multi-tenant CRM and project management built with TypeScript, Express, MongoDB, and Mongoose.

## Stack

- **Runtime:** Node.js 18+, TypeScript (strict)
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (access + refresh), bcrypt
- **Validation:** Zod
- **Security:** Helmet, CORS, rate limiting
- **Testing:** Jest, Supertest, mongodb-memory-server

## Quick Start

```bash
npm install
cp .env.example .env   # configure secrets and MongoDB URI
npm run dev
```

Server runs at `http://localhost:3000`. Health check: `GET /health`.

## Project Structure

```
src/
├── config/          # Environment, DI container, constants
├── database/        # MongoDB connection
├── middleware/      # Auth, validation, errors, org access
├── modules/         # Feature modules (auth, users, orgs, ...)
├── utils/           # Shared utilities, base repository
├── tests/           # Unit, integration, API tests
├── app.ts           # Express application
└── server.ts        # Entry point
```

Each module contains: `model`, `repository`, `service`, `controller`, `routes`, `validation`, `types`.

## API Overview

All responses use:

```json
{ "success": true, "message": "...", "data": {} }
```

Organization-scoped routes require header: `x-organization-id: <orgId>`.

| Module | Base Path |
|--------|-----------|
| Auth | `/api/auth` |
| Organizations | `/api/organizations` |
| Memberships | `/api/organizations/:organizationId/members` |
| Projects | `/api/projects` |
| Tasks | `/api/tasks` |
| Comments | `/api/comments` |
| Notifications | `/api/notifications` |
| Activities | `/api/activities` |
| Reports | `/api/reports` |

### Auth Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `POST /api/auth/change-password` (authenticated)
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me` (authenticated)

### Roles

Organization roles: **Owner**, **Admin**, **Manager**, **Member**

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm test` | Run tests with coverage |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Testing

Tests use an in-memory MongoDB instance. Target coverage: 90%+.

```bash
npm test
```

## Environment Variables

See `.env.example` for required variables including JWT secrets (min 32 characters), MongoDB URI, and rate limit settings.
