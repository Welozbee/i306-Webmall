# Project

## Quickstart (Docker)

Prerequisites:

- Docker + Docker Compose

Start in the background:

```bash
make dev
```

Or build and start:

```bash
make dev-build
```

Stop the stack:

```bash
make dev-down
```

If you prefer docker compose directly:

```bash
docker compose -f docker-compose.dev.yml up --build
```

## Services

- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- Postgres: localhost:5432 (user: postgres, password: postgres, db: app)

## Auth (JWT)

Environment variables (backend):

- `JWT_SECRET` (required)
- `JWT_EXPIRES_IN` (optional, default: `1h`)
- `REFRESH_TOKEN_TTL_DAYS` (optional, default: `7`)
- `SEED_ADMIN_EMAIL` + `SEED_ADMIN_PASSWORD` (optional, create/update an admin on seed)

Endpoints:

- `POST /auth/register` (open registration, role defaults to `USER`)
- `POST /auth/login`
- `POST /auth/refresh` (rotate refresh token)
- `POST /auth/logout` (revoke refresh token)

Protected routes:

- `POST/PUT/DELETE /shop/*` and `POST /shop/:id/images*` require `EMPLOYEE` or `ADMIN`.

## Dev Notes

- The backend runs with nodemon inside Docker so it should reload on file changes.

## Quickstart without make

```powershell
# Start
docker compose -f docker-compose.dev.yml up -d

# Build + start
docker compose -f docker-compose.dev.yml up --build -d

# Stop
docker compose -f docker-compose.dev.yml down
```
