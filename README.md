# FoxTown Mall App

<p align="center">
  <img src="frontend/public/images/foxtown-logo.png" alt="FoxTown logo" width="240" />
</p>

Application web full-stack pour un centre commercial:
- consultation des boutiques et du plan
- suivi des parkings et des visiteurs
- authentification JWT (utilisateurs/admin)
- mini-jeu avec récompenses

Le projet contient:
- un environnement de dev Docker (`docker-compose.dev.yml`)
- un déploiement Docker prêt pour serveur (`docker-compose.yml`)

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express + Prisma
- Base de donnees: PostgreSQL
- Reverse proxy: Nginx (dans le conteneur frontend)

## Deploiement (Docker)

Prerequis:
- Docker
- Docker Compose plugin

1. Creer le fichier d'environnement:

```bash
cp .env.example .env
```

2. Modifier au minimum:
- `JWT_SECRET`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`

3. Build + demarrage:

```bash
docker compose up --build -d
```

Endpoints:
- Frontend: `http://YOUR_DOMAIN_OR_SERVER_IP`
- Health API: `http://YOUR_DOMAIN_OR_SERVER_IP/api/health`

Arret:

```bash
docker compose down
```

Commandes utiles:

```bash
# Logs
docker compose logs -f

# Migrations Prisma manuelles
docker compose exec backend npx prisma migrate deploy
```

## Attention au seed

Le script `backend/prisma/seed.ts` est destructif (suppression puis recreation de donnees).
Ne pas l'executer sur une base de production si ce comportement n'est pas voulu.

Execution manuelle:

```bash
docker compose exec backend npm run seed
```

## Developpement local

Demarrer:

```bash
make dev
```

Build + demarrer:

```bash
make dev-build
```

Arreter:

```bash
make dev-down
```

Compose direct:

```bash
docker compose -f docker-compose.dev.yml up --build
```
