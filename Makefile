.PHONY: dev dev-build dev-down prod prod-build prod-down

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

dev-generate:
	sudo rm -rf backend/generated
	npx prisma generate --schema backend/prisma/schema.prisma 
