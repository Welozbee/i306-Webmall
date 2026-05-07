<p align="center">
  <img src="frontend/public/images/foxtown-icon.svg" alt="FoxTown logo" width="160" />
</p>

<h1 align="center">i306 Webmall</h1>
<p align="center">Application web full-stack pour un centre commercial — projet académique module 450</p>

---

## Table des matières

1. [Présentation](#présentation)
2. [Stack technique](#stack-technique)
3. [Démarrage rapide](#démarrage-rapide)
4. [Développement local](#développement-local)
5. [Tests](#tests)
   - [Tests unitaires](#tests-unitaires)
   - [Tests d'intégration](#tests-dintégration)
   - [Tests E2E automatisés](#tests-e2e-automatisés)
   - [Tests E2E manuels](#tests-e2e-manuels)
6. [Déploiement Docker](#déploiement-docker)
7. [Disclaimer et licence](#disclaimer-et-licence)

---

## Présentation

Webmall offre une expérience digitale pour un centre commercial :

- Découvrir les boutiques par catégorie avec lien vers leur site officiel
- Consulter le plan du centre
- Suivre la disponibilité des parkings en temps réel
- Gérer les comptes utilisateurs et les accès collaborateurs (rôles `USER` / `EMPLOYEE` / `ADMIN`)
- Jouer à un jeu promotionnel quotidien (carte à gratter) et consulter ses récompenses
- Suivre les statistiques de fréquentation (journalières, mensuelles, annuelles)

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + Prisma ORM |
| Base de données | PostgreSQL |
| Reverse proxy | Nginx (conteneur frontend) |
| Infrastructure | Docker Compose (dev + prod) |
| Tests backend | Vitest |
| Tests frontend | Vitest + React Testing Library + jsdom |
| Tests E2E | Playwright (Chromium) |

---

## Démarrage rapide

### Prérequis

- Docker Engine ≥ 24
- Docker Compose plugin

### Lancer l'environnement de développement

```bash
cp .env.example .env   # adapter les variables si besoin
make dev               # démarre tous les conteneurs
```

Services disponibles après démarrage :

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| PostgreSQL (dev) | localhost:5433 |

Arrêter :

```bash
make dev-down
```

---

## Développement local

```bash
make dev          # démarrer
make dev-build    # rebuild + démarrer
make dev-down     # arrêter
```

Migrations Prisma :

```bash
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy
```

Seed (destructif — ne pas exécuter en production) :

```bash
docker compose -f docker-compose.dev.yml exec backend npm run seed
```

---

## Tests

### Vue d'ensemble

| Catégorie | Outil | Nombre de tests |
|---|---|---|
| Unitaires backend | Vitest (Prisma + JWT mockés) | 38 |
| Unitaires frontend | Vitest + React Testing Library | 21 |
| **Total unitaires** | | **59** |
| Intégration | Vitest + PostgreSQL réel | 10 |
| E2E automatisés | Playwright Chromium | 7 |
| E2E manuel | Protocole écrit | 1 |
| **Total général** | | **76 + 1 manuel** |

---

### Lancer tous les tests — guide étape par étape

#### Étape 1 — Prérequis

```bash
# Installer les dépendances backend
cd backend && npm install && cd ..

# Installer les dépendances frontend
cd frontend && npm install && cd ..

# Installer le navigateur Playwright (une seule fois)
cd frontend && sudo npx playwright install --with-deps chromium && cd ..
```

#### Étape 2 — Tests unitaires (aucune dépendance externe)

Les tests unitaires sont entièrement isolés via des mocks. Ils s'exécutent sans Docker ni base de données.

```bash
# Backend (38 tests) — Prisma et JWT mockés
make test

# Frontend (21 tests) — fetch, EventSource, IntersectionObserver mockés
cd frontend && npm run test:run
```

Résultat attendu : toutes les suites affichent `✓ X tests passed`.

#### Étape 3 — Tests d'intégration (nécessite la base de données)

Les tests d'intégration s'exécutent contre une vraie base PostgreSQL. Ils sont inclus dans la même suite Vitest que les unitaires et se **sautent automatiquement** si la base n'est pas accessible.

```bash
# 1. Démarrer les conteneurs Docker (démarre PostgreSQL sur localhost:5433)
make dev

# 2. Attendre que la base soit prête (~10 secondes), puis lancer
make test-integration
```

> La cible `test-integration` passe automatiquement `DATABASE_URL` pointant vers le conteneur de développement. Les 10 tests d'intégration passent de `skipped` à `passed`.

Pour une base dédiée distincte :

```bash
# Appliquer les migrations sur la base cible
cd backend
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public" \
  npx prisma migrate deploy --schema=prisma/schema.prisma

# Lancer les tests
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public" npm test
```

#### Étape 4 — Tests E2E automatisés (nécessite le frontend lancé)

Les tests Playwright interceptent les appels API (`page.route()`), ils sont reproductibles **sans backend opérationnel**. Seul le serveur de développement frontend doit tourner.

```bash
# 1. S'assurer que les conteneurs sont démarrés (frontend accessible sur :5173)
make dev

# 2. Lancer tous les tests E2E
cd frontend && npm run test:e2e

# Ou par module
npx playwright test e2e/auth.spec.ts --project=chromium
npx playwright test e2e/game.spec.ts --project=chromium

# Mode UI interactif (observer l'exécution dans le navigateur)
npm run test:e2e:ui
```

#### Étape 5 — Test E2E manuel

Suivre le protocole décrit dans [`docs/e2e-manuel.md`](docs/e2e-manuel.md).

Prérequis : `make dev` démarré, base de données vide pour le compte de test.

---

### Rapports de couverture

```bash
# Backend (seuil : 80 % lignes / fonctions / branches)
make test-coverage

# Frontend (seuil : 60 % lignes / fonctions / branches)
cd frontend && npm run test:coverage
```

Les rapports HTML sont générés dans `backend/coverage/` et `frontend/coverage/`.

---

### Référence des cas de test

#### Unitaires backend

| Fichier | Identifiants | Scénarios couverts |
|---|---|---|
| `backend/src/routes/auth.test.ts` | U-AUTH-01 à 19 | Register, login, logout, refresh token, erreurs 400/401/409/500 |
| `backend/src/routes/game.test.ts` | U-GAME-01 à 19 | Status, play (gain/perte/quota), rewards, SSE, erreurs |

#### Unitaires frontend

| Fichier | Identifiants | Scénarios couverts |
|---|---|---|
| `frontend/src/pages/LoginPage.test.tsx` | U-AUTH-FE-01 à 07 | Rendu, connexion réussie, identifiants invalides, chargement, champs requis, lien inscription, erreur réseau |
| `frontend/src/pages/RegisterPage.test.tsx` | U-AUTH-FE-08 à 12 | Rendu, inscription réussie, email dupliqué, mots de passe différents, lien connexion |
| `frontend/src/contexts/AuthContext.test.tsx` | U-AUTH-FE-13 à 16 | État initial, login, logout, persistance session via localStorage |
| `frontend/src/lib/api.test.ts` | U-AUTH-FE-17 à 19 | Header Authorization, refresh token automatique, session expirée |
| `frontend/src/components/WinBanner.test.tsx` | U-GAME-FE-12 à 13 | Bannière sur événement SSE `win`, absence sans événement |

#### Intégration

| Fichier | Identifiants | Scénarios couverts |
|---|---|---|
| `backend/src/routes/auth.integration.test.ts` | I-AUTH-01 à 02 | Register en base réelle, login avec vrai hash bcrypt |
| `backend/src/routes/game.integration.test.ts` | I-GAME-01 à 04 | Play avec persistance DB, quota journalier, rewards en base |

#### E2E automatisés

| Identifiant | Fichier | Scénario |
|---|---|---|
| E2E-AUTH-FE-01 | `e2e/auth.spec.ts` | Inscription → connexion → déconnexion |
| E2E-AUTH-FE-02 | `e2e/auth.spec.ts` | Accès `/admin` sans auth → redirection `/login` |
| E2E-AUTH-FE-03 | `e2e/auth.spec.ts` | Inscription → déconnexion → message "connectez-vous" |
| E2E-AUTH-FE-04 | `e2e/auth.spec.ts` | Connexion avec identifiants invalides → message d'erreur |
| E2E-GAME-FE-01 | `e2e/game.spec.ts` | Connexion → gratter la carte → résultat affiché |
| E2E-GAME-FE-02 | `e2e/game.spec.ts` | Connexion → `/rewards` → historique des gains affiché |
| E2E-GAME-FE-03 | `e2e/game.spec.ts` | Connexion → quota épuisé → message "déjà joué" affiché |

#### E2E manuel

| Identifiant | Document | Scénario |
|---|---|---|
| E2E-GAME-MANUEL-01 | [`docs/e2e-manuel.md`](docs/e2e-manuel.md) | Inscription → grattage → résultat → récompenses → déconnexion |

---

## Déploiement Docker

```bash
cp .env.example .env
```

Modifier au minimum dans `.env` :

```
JWT_SECRET=<valeur-secrete>
POSTGRES_USER=<utilisateur>
POSTGRES_PASSWORD=<mot-de-passe>
POSTGRES_DB=<nom-base>
```

Build et démarrage :

```bash
docker compose up --build -d
```

Endpoints :

| Service | URL |
|---|---|
| Frontend | `http://YOUR_SERVER_IP` |
| Health API | `http://YOUR_SERVER_IP/api/health` |

Arrêt :

```bash
docker compose down
```

Logs :

```bash
docker compose logs -f
```

---

## Disclaimer et licence

Ce projet est un **projet académique** réalisé dans le cadre du module 450.

- Il n'est pas un produit officiel et n'est affilié à aucune entreprise réelle.
- Les marques et noms visibles sont utilisés uniquement à des fins de démonstration.
- Utilisation **strictement non commerciale** — voir `LICENSE` (NCAL v1.0).
