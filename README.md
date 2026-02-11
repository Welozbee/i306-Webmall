<p align="center">
  <img src="frontend/public/images/foxtown-icon.svg" alt="FoxTown logo" width="180" />
</p>

## ✨ Une experience digitale complete pour un centre commercial

Ce projet propose une application web moderne, rapide et immersive pour un mall:
- 🛍️ decouvrir les boutiques par categorie
- 🗺️ consulter le plan du centre
- 🅿️ suivre la disponibilite des parkings
- 👤 gerer l'authentification (utilisateur/admin)
- 🎁 jouer et gagner des recompenses
- 📊 suivre les visites et l'activite

Objectif: offrir une base realiste de produit digital "retail" avec une architecture propre, deploiement Docker et stack full-stack actuelle.

## ⚠️ Disclaimer important

Ce repository est un **projet personnel / academique**.
Il est inspire d'un cas d'usage de centre commercial, mais:
- il **n'est pas un produit officiel**
- il **n'est en aucun cas affilie, sponsorise, valide ou maintenu** par l'entreprise reelle
- les marques/noms visibles sont utilises uniquement dans un cadre de demonstration

## 🧱 Stack technique

- Frontend: React + Vite
- Backend: Node.js + Express + Prisma
- Base de donnees: PostgreSQL
- Reverse proxy: Nginx (dans le conteneur frontend)
- Infra locale/prod: Docker Compose

## ✅ Cahier des charges: reponse point par point

### 1) Application web complete (front + back + DB)
- **Reponse apportee**: architecture separee `frontend/` + `backend/` + PostgreSQL via Docker.

### 2) Gestion des donnees metier (boutiques, parkings, utilisateurs)
- **Reponse apportee**: modelisation Prisma + migrations SQL + endpoints API dedies.

### 3) Authentification et roles
- **Reponse apportee**: JWT access/refresh token, routes protegees, roles (`USER`, `EMPLOYEE`, `ADMIN`).

### 4) Fonctionnalites engageantes pour les visiteurs
- **Reponse apportee**: module de jeu avec probabilites, lots, recompenses et affichage client.

### 5) Observabilite basique et robustesse
- **Reponse apportee**: endpoint `/health`, logs middleware, persistence Postgres, gestion des erreurs API.

### 6) Deploiement conteneurise
- **Reponse apportee**: stack dev (`docker-compose.dev.yml`) + stack deploiement (`docker-compose.yml`) avec proxy Nginx.

### 7) Exploitabilite et documentation
- **Reponse apportee**: README de lancement, fichiers `.env`, commandes de migration et run Docker standardisees.

## 🚀 Deploiement Docker

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

## 🌱 Attention au seed

Le script `backend/prisma/seed.ts` est destructif (suppression puis recreation de donnees).
Ne pas l'executer sur une base de production si ce comportement n'est pas voulu.

Execution manuelle:

```bash
docker compose exec backend npm run seed
```

## 💻 Developpement local

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
