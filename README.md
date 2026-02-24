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

Ce repository est un **projet academique**.
Il est inspire d'un cas d'usage de centre commercial, mais:

- il **n'est pas un produit officiel**
- il **n'est en aucun cas affilie, sponsorise, valide ou maintenu** par l'entreprise reelle
- les marques/noms visibles sont utilises uniquement dans un cadre de demonstration
- son utilisation est **strictement non commerciale** (voir section Licence)

## 🧱 Stack technique

- Frontend: React + Vite
- Backend: Node.js + Express + Prisma
- Base de donnees: PostgreSQL
- Reverse proxy: Nginx (dans le conteneur frontend)
- Infra locale/prod: Docker Compose

## 📋 Cahier des charges client

Le projet repond au brief suivant:

- repertorier toutes les boutiques du centre
- fournir un lien vers le site officiel de chaque magasin
- proposer un jeu en page d'accueil (compte requis, 1 tentative/jour + 2e chance si echec, max 10 cadeaux/jour)
- afficher le plan du centre
- permettre des mises a jour faciles par les collaborateurs
- afficher les places disponibles dans les parkings
- enregistrer les visiteurs et sortir des stats journalieres/mensuelles/annuelles
- rester sur une solution economique et legale

## ✅ Comment le projet y repond

### 🛍️ Boutiques repertoriees

- Donnees boutiques stockees en base PostgreSQL.
- Endpoints API dedies + affichage frontend par liste/detail.

### 🔗 Lien vers le site officiel de chaque magasin

- Chaque boutique expose un champ `url` pour rediriger vers le site officiel.

### 🎁 Jeu de la page d'accueil conforme aux regles

- Connexion obligatoire (compte utilisateur requis).
- Regles metier implementees:
- 1 jeu par jour.
- 2e tentative autorisee uniquement si la 1re est perdante.
- plafond global de 10 gains par jour.
- Lots et recompenses geres en base avec attribution de voucher code.

### 🗺️ Plan du centre

- Page plan disponible cote frontend avec integration des ressources visuelles du centre.

### 👥 Mises a jour faciles par les collaborateurs

- Gestion via interface admin et routes protegees par roles (`EMPLOYEE`, `ADMIN`).
- Les contenus metier (boutiques/images/parkings) se mettent a jour sans coder.

### 🅿️ Places de parking disponibles

- Entite `Parking` en base + endpoints pour lecture/mise a jour des disponibilites.

### 📊 Statistiques de frequentation

- Journalisation des visites (`VisitorLog`).
- Exploitable pour extraire des stats journalieres, mensuelles et annuelles.

### 💸 Budget serre + legalite

- Stack basee sur des technologies open-source (React, Node.js, Prisma, PostgreSQL, Nginx, Docker).
- Deploiement self-hosted possible pour limiter les couts d'exploitation.
- Aucune dependance obligatoire a des services SaaS payants.
- Le projet reste dans un cadre legal de demonstration et d'usage non commercial (voir disclaimer et licence).

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

## 📄 Licence

Ce projet est distribue sous licence **NCAL v1.0 (Non-Commercial Academic License)**.
Utilisation personnelle et academique autorisee.
Toute utilisation commerciale est interdite sans autorisation ecrite.
Voir le fichier `LICENSE`.
