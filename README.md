# SaaS Platform — Multi-Tenant Backend

A small but representative slice of a modern multi-tenant SaaS platform built with NestJS, PostgreSQL, and a minimal browser UI for reviewer validation.

## Architecture Overview

The system acts as a central control layer that:
- Isolates tenant (practice) data server-side
- Enforces role-based permissions on every endpoint
- Integrates with a mock external system (EmailProvider)
- Executes all side effects through a central Action Gateway
- Records an append-only audit trail
- Supports controlled extensibility via an extension resolver

## Tech Stack

- **Backend**: NestJS (TypeScript)
- **Database**: PostgreSQL via TypeORM
- **Auth**: JWT (passport-jwt)
- **UI**: Single-page React 18 (CDN, no build step), functional components + hooks

---

## Project Structure

```
src/
├── entities/              10 TypeORM entities (auto-synced to DB)
├── common/
│   ├── guards/            JwtAuthGuard, PracticeContextGuard, PermissionsGuard
│   │                      + practice-context.guard.spec.ts
│   └── decorators/        @Public(), @RequirePermissions(), @CurrentUser(), @CurrentMembership()
├── auth/                  POST /api/auth/login
│                          POST /api/auth/register
│                          POST /api/auth/impersonate  ← reviewer UI only
├── practices/             GET  /api/practices
├── clients/               CRUD /api/practices/:id/clients
├── actions/               POST /api/practices/:id/actions  ← Action Gateway
│                          + actions.service.spec.ts
├── audit/                 GET  /api/practices/:id/audit
├── extensions/            GET  /api/practices/:id/clients/:id/extensions
├── email-provider/        Mock EmailProvider (writes to sent_emails table)
├── integrations/          Scope approval checker
├── users/                 GET  /api/users  ← reviewer UI only
└── database/seed.ts       Seed script
public/index.html          Reviewer UI (2 screens)
```

---

## Getting Started

### Prerequisites

- Node.js 16+
- Podman (or any OCI-compatible container runtime with podman-compose)

### 1. Start PostgreSQL

```bash
podman-compose up -d
```

Starts PostgreSQL 15 on port `5432` with user `postgres`, password `postgres`, database `saas_platform`.

### 2. Install dependencies

```bash
npm install
```

### 3. Seed the database

```bash
npm run seed
```

This runs `ts-node -r dotenv/config src/database/seed.ts`, loading `.env` before TypeScript compilation begins.

Expected output:

```
🌱 Seeding database...
✅ Practices created
✅ Users created
✅ Memberships created
✅ Clients created
✅ Integration created
✅ Practice integrations created
✅ Extensions created

🎉 Seed complete!

Seed accounts (password: password123):
  alice@sunrise.com       → PracticeAdmin @ Sunrise Dental
  alice@sunrise.com       → Staff @ Metro Health
  bob@sunrise.com         → Staff @ Sunrise Dental
  carol@metro.com         → PracticeAdmin @ Metro Health
  integration@sunrise.com → Integration @ Sunrise Dental
```

> **Run once on a clean database.** The seed inserts with unique constraints — re-running against an already-seeded database will fail. To re-seed, restart the Postgres container (which resets the volume) then run the seed again:
> ```bash
> podman-compose down -v && podman-compose up -d && npm run seed
> ```

### 4. Start the server

```bash
npm run start:dev   # development (watch mode)
# or
npm run build && npm start   # production
```

### 5. Open the UI

```
http://localhost:3000/index.html
```

### 6. Run tests

```bash
npm test
```

---

## Seed Accounts

The UI uses a user-selector — no password needed. Seed accounts:

| Email | Role | Practice |
|---|---|---|
| alice@sunrise.com | PracticeAdmin | Sunrise Dental |
| alice@sunrise.com | Staff | Metro Health |
| bob@sunrise.com | Staff | Sunrise Dental |
| carol@metro.com | PracticeAdmin | Metro Health |
| integration@sunrise.com | Integration | Sunrise Dental |

> Passwords are `password123` if using `POST /auth/login` directly via API.

---

## Reviewer UI

The UI has no login screen. It is designed for a non-technical reviewer to validate system behaviour.

### Screen 1 — Context + Client List

| Element | Behaviour |
|---|---|
| User dropdown | Populated from `GET /api/users`; selecting a user calls `POST /api/auth/impersonate` to obtain a JWT |
| Practice dropdown | Populated from `GET /api/practices` filtered to the selected user's memberships; shows role badge |
| Client list | `GET /api/practices/:id/clients` — refreshes on practice switch |
| Create Client button | Calls `POST /api/practices/:id/clients`; **PracticeAdmin** succeeds; **Staff** receives a `403` error inline (server-enforced) |
| Delete button | One per client row; calls `DELETE /api/practices/:id/clients/:cid`; **PracticeAdmin** succeeds; **Staff** receives a `403` error inline (server-enforced) |

### Screen 2 — Client Detail

Opened by clicking **View →** on any client row. Contains:

| Panel | Content |
|---|---|
| Extensions | `GET /api/practices/:id/clients/:cid/extensions?slot=client.sidepanel` — resolved server-side; only returns extensions whose `slot` matches, whose `requiredScopes` are approved by the practice, and whose `visibleToRoles` includes the current user's role |
| Send Email | Visible only to roles with `action:email.send` (**PracticeAdmin**, **Integration**); **Staff** sees a permission-denied message instead of the form. Submitting calls the Action Gateway (`POST /api/practices/:id/actions`); shows idempotency notice on duplicate key |
| Audit Log | `GET /api/practices/:id/audit` — refreshes after every send; displays actor, action, target, and outcome |

Errors from missing permissions or unapproved scopes are shown inline next to the element that triggered them.

---

## API Reference

All endpoints are prefixed with `/api`.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | — | Login with email + password, returns JWT |
| POST | `/auth/register` | — | Register new user |
| POST | `/auth/impersonate` | — | **Reviewer only** — returns JWT for any user by email, no password required |

### Users

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users` | — | **Reviewer only** — list all users for the UI user-selector |

### Practices

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/practices` | JWT | List practices the current user belongs to (with role) |

### Clients

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/practices/:id/clients` | `read:clients` | List clients |
| GET | `/practices/:id/clients/:cid` | `read:clients` | Get client |
| POST | `/practices/:id/clients` | `write:clients` | Create client |
| PUT | `/practices/:id/clients/:cid` | `write:clients` | Update client |
| DELETE | `/practices/:id/clients/:cid` | `write:clients` | Delete client |

### Action Gateway

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/practices/:id/actions` | `action:email.send` | Execute an action |

Request body:
```json
{
  "type": "email.send",
  "client_id": "<uuid>",
  "to": "recipient@example.com",
  "subject": "Hello",
  "body": "Message body",
  "idempotency_key": "unique-key-per-operation"
}
```

### Audit Log

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/practices/:id/audit` | JWT + member | List audit entries (newest first) |

### Extensions

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/practices/:id/clients/:cid/extensions?slot=client.sidepanel` | JWT + member | Resolve extensions for a slot |

---

## How Requirements Map to Code

### 1. Multi-Tenancy

Every route under `/practices/:practiceId/*` runs through `PracticeContextGuard`, which:
1. Extracts `practiceId` from the route params
2. Queries `practice_memberships` to confirm the current user is a member
3. Attaches the membership to the request (providing role context)
4. Throws `403 Forbidden` if the user is not a member

Cross-practice access is **impossible** — the guard runs before any service logic.

### 2. Roles & Permissions (RBAC)

Defined in [`src/common/roles.ts`](src/common/roles.ts):

| Role | Permissions |
|---|---|
| PracticeAdmin | `read:clients`, `write:clients`, `action:email.send` |
| Staff | `read:clients` |
| Integration | `read:clients`, `action:email.send` |

`PermissionsGuard` reads `@RequirePermissions(...)` metadata from route handlers and checks the role attached by `PracticeContextGuard`. UI-only enforcement is explicitly **not** used — Staff clicking "Create Client" or "Delete" receives a real `403` from the server.

### 3. Integration & Scopes (Mocked)

`EmailProvider` is a mock integration seeded with `requiredScopes: ['client.write']`.

Each practice has a `PracticeIntegration` record listing its `approvedScopes`. The Action Gateway calls `IntegrationsService.hasScopesApproved()` before executing any action — if the practice has not approved `client.write`, the request is rejected with `403`.

No real OAuth is involved. Scope approval is seeded in [`src/database/seed.ts`](src/database/seed.ts). Both practices have `client.write` and `email.write` approved, so ClientNotes and QuickEmail are both visible (subject to role filtering).

### 4. Action Gateway

`POST /practices/:practiceId/actions` is the **only** place where email sending occurs. The gateway enforces this flow in order:

1. `PracticeContextGuard` — user must be a member
2. `PermissionsGuard` — user must have `action:email.send`
3. Validate `client_id` belongs to this practice
4. Validate `client.write` scope is approved for this practice
5. Check idempotency key (unique constraint on `action_runs`)
6. Execute via `EmailProviderService.send()` (writes to `sent_emails`)
7. Record `ActionRun` with status and result
8. Write `AuditLog` entry

Sending email from anywhere else in the codebase is architecturally blocked — `EmailProviderService` is only imported by `ActionsModule`.

### 5. Audit Log

The `audit_logs` table is append-only (no update/delete operations exist in the codebase). Each entry records:

- `practice_id` — tenant
- `actor_id` + `actor_type` — user or integration
- `action` — e.g. `email.send`
- `target_id` + `target_type` — e.g. the client
- `outcome` — `success` or `failure`
- `metadata` — e.g. `{ to, subject, idempotencyKey }`
- `timestamp`

### 6. Extension Resolver

Extensions are seeded records with a `slot`, `requiredScopes`, and `visibleToRoles`. All array fields are stored as `jsonb` columns to guarantee reliable array deserialisation from PostgreSQL.

`GET /practices/:id/clients/:cid/extensions?slot=client.sidepanel` returns only extensions where:
- `slot` matches the query param
- `requiredScopes` are all approved by the practice's integrations
- `visibleToRoles` includes the current user's role

Three seeded extensions demonstrate the filtering for `slot: client.sidepanel`:

| Name | Required Scopes | Visible To | Returned for… |
|---|---|---|---|
| ClientNotes | `client.write` | PracticeAdmin, Staff | PracticeAdmin ✓, Staff ✓, Integration ✗ |
| QuickEmail | `email.write` | PracticeAdmin, Integration | PracticeAdmin ✓, Staff ✗, Integration ✓ |
| BillingWidget | `billing.read` | PracticeAdmin | Never — no practice has `billing.read` approved |

**What each role sees in the `client.sidepanel` slot:**

| Role | ClientNotes | QuickEmail | BillingWidget |
|---|---|---|---|
| PracticeAdmin | ✓ | ✓ | ✗ (scope not approved) |
| Staff | ✓ | ✗ (not in visibleToRoles) | ✗ (not in visibleToRoles) |
| Integration | ✗ (not in visibleToRoles) | ✓ | ✗ |

### 7. Mock Email Provider

`EmailProviderService.send()` writes to the `sent_emails` table instead of calling a real email API. Each row stores `practice_id`, `client_id`, `to`, `subject`, `body`, and `timestamp`, allowing deterministic verification of what was "sent".

---

## Tests

```bash
npm test
```

Two test suites, 9 tests total. All tests use Jest with mocked repositories — no database required.

### Suite 1 — Cross-practice isolation ([`src/common/guards/practice-context.guard.spec.ts`](src/common/guards/practice-context.guard.spec.ts))

Covers requirement: **"A user cannot access clients from another practice"**

| Test | Assertion |
|---|---|
| User not in practice | Guard throws `ForbiddenException`; repository queried with correct practiceId + userId |
| User is a member | Guard returns `true`; membership object is attached to request |
| Alice (admin of practice-1) requests practice-2 | Guard throws `ForbiddenException` |

### Suite 2 — Action Gateway blocking ([`src/actions/actions.service.spec.ts`](src/actions/actions.service.spec.ts))

Covers requirement: **"An action is blocked when permission or required scope is missing"**

| Test | Assertion |
|---|---|
| Scope not approved | `execute()` throws `ForbiddenException` |
| Scope not approved | `EmailProvider.send` is never called |
| Scope not approved | No audit entry is written |
| All checks pass | `EmailProvider.send` called; audit entry written with `outcome: success` |
| Duplicate idempotency key | Returns `idempotent: true`; `EmailProvider.send` not called again |
| Integration role membership | Audit entry records `actorType: integration` |

---

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASS=postgres
DATABASE_NAME=saas_platform
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
PORT=3000
```
