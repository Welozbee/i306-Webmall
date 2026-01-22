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
