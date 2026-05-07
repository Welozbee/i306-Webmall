.PHONY: dev dev-build dev-down prod prod-build prod-down test test-watch test-coverage test-integration

dev:
	docker compose -f docker-compose.dev.yml up -d

dev-build:
	docker compose -f docker-compose.dev.yml up --build -d

dev-interactive:
	docker compose -f docker-compose.dev.yml up

dev-build-interactive:
	docker compose -f docker-compose.dev.yml up --build

dev-down:
	docker compose -f docker-compose.dev.yml down

prod:
	docker compose up -d

prod-build:
	docker compose up --build -d

prod-down:
	docker compose down

test:
	cd backend && npm test

test-watch:
	cd backend && npm run test:watch

test-coverage:
	cd backend && npm run test:coverage

test-integration:
	cd backend && DATABASE_URL="postgresql://postgres:postgres@localhost:5433/app?schema=public" npm test

dev-generate:
	sudo rm -rf backend/generated
	npx prisma generate --schema backend/prisma/schema.prisma 
