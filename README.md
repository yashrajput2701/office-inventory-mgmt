# Office Inventory Management System

An Order Management System for office supplies. A **Creator** raises a purchase
request (draft → submit). A **Purchaser** reviews submitted requests, executes
the transaction offline, and marks it **Completed** (with a txn reference) or
**Rejected** (with a note).

## Stack

- **Backend**: Java 17, Spring Boot 3.3.4, Spring Security + JWT, Spring Data JPA, H2 (file-based)
- **Frontend**: React 18 + TypeScript + Vite, React Router, Axios
- **Ports**: backend `8081`, frontend `5174` (both avoid 8080/5173 per spec)

## Project layout

```
office-inventory-mgmt/
├── backend/    Spring Boot app (Maven)
└── frontend/   React app (Vite)
```

## Running it locally

### Backend

```bash
cd backend
mvn spring-boot:run
```

This starts the API on `http://localhost:8081`. On first run it creates a file-based
H2 database at `backend/data/inventory.mv.db` and seeds three users (see below).
The H2 console is available at `http://localhost:8081/h2-console`
(JDBC URL: `jdbc:h2:file:./data/inventory`, user `sa`, empty password) if you want
to poke at the data directly.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:5174`. The API base URL is hardcoded to
`http://localhost:8081/api` in `src/api/client.ts` — change that (or wire up
`.env.example`) if you deploy the backend elsewhere.

### Seeded accounts

| Username     | Password       | Role       |
|--------------|----------------|------------|
| `creator1`   | `creator123`   | CREATOR    |
| `creator2`   | `creator123`   | CREATOR    |
| `purchaser1` | `purchaser123` | PURCHASER  |

(Defined in `backend/src/main/resources/data.sql`. Change or add rows there —
passwords must be BCrypt hashes.)

## Core business rules implemented

- **Draft editing**: only the creator who owns a `DRAFT` order can edit or submit it.
  Once `SUBMITTED`, the order is locked — no further edits by the creator.
- **No duplicate item sets among active orders**: on submit, the backend computes a
  SHA-256 fingerprint of the order's (sorted, de-duplicated, case-insensitive) item
  names and rejects the submit if another `SUBMITTED` or `COMPLETED` order already
  has the same fingerprint. Drafts are exempt, so two creators can happily draft
  overlapping lists — the conflict is only enforced at submit time, as specified.
  A `REJECTED` order frees up its item combination for reuse.
- **Role-scoped visibility**: Creators see only their own orders (all statuses).
  Purchasers see every order that has left `DRAFT` (their working queue plus history).
- **Purchaser actions**: `POST /orders/{id}/complete` (requires `txnReference`) and
  `POST /orders/{id}/reject` (requires a `note`) — both only valid from `SUBMITTED`.

## Not implemented (flagged as optional in the spec)

- **Reject → amend → resubmit loop**: v1 treats `REJECTED` as terminal. The creator
  would need to raise a fresh request. Straightforward to add later (see below).
- **Self-registration / admin user management**: users are seeded directly in the DB.
- **Payment/transaction execution**: explicitly out of scope per the spec — the
  purchaser just records a reference for whatever they did offline.

## API summary

| Method | Path                         | Role      | Notes |
|--------|------------------------------|-----------|-------|
| POST   | `/api/auth/login`            | public    | returns JWT |
| POST   | `/api/auth/change-password`  | any       | |
| GET    | `/api/users/me`              | any       | |
| GET    | `/api/orders`                | any       | role-filtered list |
| GET    | `/api/orders/{id}`           | any       | owner or purchaser (non-draft) |
| POST   | `/api/orders`                | CREATOR   | create draft |
| PUT    | `/api/orders/{id}`           | CREATOR   | edit own draft |
| POST   | `/api/orders/{id}/submit`    | CREATOR   | lock + enforce item-set uniqueness |
| POST   | `/api/orders/{id}/complete`  | PURCHASER | body: `{ txnReference }` |
| POST   | `/api/orders/{id}/reject`    | PURCHASER | body: `{ note }` |

All routes except `/api/auth/**` require `Authorization: Bearer <token>`.

## Security notes

- Passwords hashed with BCrypt.
- Stateless JWT auth (HS256), 24h expiry — see `app.jwt.secret` in
  `application.yml`. **Rotate this before any real deployment.**
- CORS locked to `http://localhost:5174` via `app.cors.allowed-origins`.
- CSRF disabled (stateless token API, not cookie-based sessions).

## Suggested next steps if you extend this

1. **Resubmit flow**: add `AMENDING` status or just allow `REJECTED → DRAFT` via a
   creator-triggered "Revise" action, copying items into an editable draft.
2. **Admin role**: user CRUD, password resets, deactivation.
3. **Item catalog**: replace free-text item names with a managed `Item` table (adds
   validation, autocomplete, and cleaner reporting).
4. Swap H2 for Postgres by changing `spring.datasource.*` in `application.yml` and
   the `com.h2database:h2` dependency in `pom.xml` — the JPA layer doesn't change.

## Pushing to GitHub

```bash
cd office-inventory-mgmt
git init
git add .
git commit -m "Initial scaffold: Spring Boot backend + React frontend"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

The `.gitignore` already excludes `node_modules/`, `target/`, and the local H2
data files.
