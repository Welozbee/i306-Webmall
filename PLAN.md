# Plan d'implémentation des tests — WebMall (FoxTown)

**Module 450 — EPSIC**  
**Auteurs :** Mathieu Rais, Daniel Baiao  
**Concept de tests :** v1.0 (18.03.2026)  
**Dernière mise à jour du plan :** 02.04.2026

---

## Contexte

Le concept de tests du projet WebMall définit trois niveaux de tests à mettre en œuvre :

- **Tests unitaires** (≥ 50) — vérification des plus petites unités fonctionnelles, avec mocks/stubs/fakes
- **Tests d'intégration** (≥ 5) — vérification des interactions entre couches (API ↔ DB, auth ↔ routes)
- **Tests E2E** (≥ 1 manuel + ≥ 1 automatisé Playwright) — validation des parcours utilisateur complets

Les zones critiques à couvrir en priorité : **jeu promotionnel**, **authentification**, **limitation quotidienne**.

---

## Résumé des phases

| Phase | Nom | Type | Objectif quantitatif | Statut |
|-------|-----|------|----------------------|--------|
| 0 | Infrastructure de test | Setup | Zéro test — config seulement | ⬜ En attente |
| 1 | Fonctionnalités principales | Unit + Intégration | ~10 tests | ⬜ En attente |
| 2 | Système utilisateur | Unit + Intégration | ~15 tests | ⬜ En attente |
| 3 | Jeu promotionnel | Unit + Intégration | ~20 tests | ⬜ En attente |
| 4 | Fonctionnalités supplémentaires | Unit + Intégration | ~10 tests | ⬜ En attente |
| 5 | Tests E2E Playwright | E2E automatisé | 4 specs Playwright | ⬜ En attente |
| 6 | Documentation et couverture | Documentation | README + rapport coverage | ⬜ En attente |

> **Légende :** ⬜ En attente — 🔄 En cours — ✅ Terminé

---

## Phase 0 — Infrastructure de test

**Statut :** ⬜ En attente

### Backend (`backend/`)

- [ ] Installer les dépendances de test :
  ```
  npm install -D vitest @vitest/coverage-v8 supertest @types/supertest
  ```
- [ ] Créer `backend/vitest.config.ts`
- [ ] Créer `backend/.env.test` avec `JWT_SECRET`, `DATABASE_URL` de test
- [ ] Ajouter les scripts dans `backend/package.json` :
  - `"test": "vitest run"`
  - `"test:watch": "vitest"`
  - `"test:coverage": "vitest run --coverage"`
- [ ] Créer le dossier `backend/src/__tests__/` avec les sous-dossiers :
  - `backend/src/__tests__/routes/`
  - `backend/src/__tests__/middlewares/`
  - `backend/src/__tests__/setup.ts` (fichier de configuration globale)

### Frontend (`frontend/`)

- [ ] Installer les dépendances de test :
  ```
  npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
  ```
- [ ] Créer `frontend/vitest.config.ts`
- [ ] Créer le dossier `frontend/src/__tests__/` avec les sous-dossiers :
  - `frontend/src/__tests__/pages/`
  - `frontend/src/__tests__/components/`
  - `frontend/src/__tests__/contexts/`
  - `frontend/src/__tests__/setup.ts`

### E2E (`e2e/`)

- [ ] Installer Playwright à la racine :
  ```
  npm install -D @playwright/test
  npx playwright install --with-deps chromium
  ```
- [ ] Créer `playwright.config.ts` à la racine
- [ ] Créer le dossier `e2e/` avec `e2e/README.md`

---

## Phase 1 — Tests des fonctionnalités principales

**Statut :** ⬜ En attente

Couvre : affichage des boutiques, navigation, liens externes, page d'accueil.

### Fichiers à créer

- [ ] `backend/src/__tests__/routes/shop.test.ts`
- [ ] `frontend/src/__tests__/pages/BoutiquesPage.test.tsx`
- [ ] `frontend/src/__tests__/pages/HomePage.test.tsx`

### Cas de test backend — `GET /shop` et `GET /shop/:id`

- [ ] `GET /shop` retourne un tableau de boutiques (200)
- [ ] `GET /shop/:id` avec id valide retourne la boutique (200)
- [ ] `GET /shop/:id` avec id non numérique retourne 400
- [ ] `GET /shop/:id` avec id inexistant retourne 404

### Cas de test frontend — BoutiquesPage

- [ ] La page affiche la liste des boutiques (mock API)
- [ ] Chaque boutique affiche son nom et ses informations
- [ ] Un lien vers le site officiel est présent si `url` n'est pas vide
- [ ] Affichage d'un message si aucune boutique n'est disponible

### Cas de test frontend — HomePage

- [ ] La page s'affiche sans erreur
- [ ] Les informations principales du centre commercial sont visibles
- [ ] Le jeu promotionnel est accessible depuis la page d'accueil (lien ou composant)

---

## Phase 2 — Tests du système utilisateur

**Statut :** ⬜ En attente

Couvre : inscription, connexion, déconnexion, gestion des sessions, validation JWT, contrôle des rôles.

### Fichiers à créer

- [ ] `backend/src/__tests__/routes/auth.test.ts`
- [ ] `backend/src/__tests__/middlewares/auth.test.ts`
- [ ] `frontend/src/__tests__/contexts/AuthContext.test.tsx`
- [ ] `frontend/src/__tests__/pages/LoginPage.test.tsx`

### Cas de test backend — `POST /auth/register`

- [ ] Inscription valide → 201 avec `accessToken`, `refreshToken`, `user`
- [ ] Email manquant → 400
- [ ] Mot de passe manquant → 400
- [ ] Email invalide (sans `@`) → 400
- [ ] Mot de passe < 8 caractères → 400
- [ ] Email déjà utilisé → 409

### Cas de test backend — `POST /auth/login`

- [ ] Connexion valide → 200 avec tokens
- [ ] Mauvais mot de passe → 401
- [ ] Email inexistant → 401
- [ ] Champs manquants → 400

### Cas de test backend — `POST /auth/logout` et `POST /auth/refresh`

- [ ] Déconnexion valide → 204
- [ ] Déconnexion sans `refreshToken` → 400
- [ ] Refresh valide → 200 avec nouveaux tokens
- [ ] Refresh avec token expiré/invalide → 401

### Cas de test backend — middleware `authenticate` / `authorize`

- [ ] Token Bearer valide → hydrate `req.user`, appelle `next()`
- [ ] Absence d'en-tête Authorization → 401
- [ ] Token invalide (signature erronée) → 401
- [ ] Token expiré → 401
- [ ] `authorize(ADMIN)` avec rôle USER → 403
- [ ] `authorize(EMPLOYEE, ADMIN)` avec rôle EMPLOYEE → appelle `next()`

### Cas de test frontend — AuthContext

- [ ] `login()` stocke `accessToken` et `refreshToken` dans `localStorage`
- [ ] `logout()` supprime les tokens du `localStorage` et remet `user` à null
- [ ] `getUserFromToken()` restaure la session depuis un token valide en `localStorage`
- [ ] `getUserFromToken()` retourne null si le token est expiré
- [ ] `isEmployee` est `true` pour les rôles EMPLOYEE et ADMIN, `false` pour USER

### Cas de test frontend — LoginPage

- [ ] La page affiche un formulaire email + mot de passe
- [ ] Soumission valide appelle `login()` du contexte
- [ ] Affichage d'un message d'erreur si les identifiants sont incorrects

---

## Phase 3 — Tests du jeu promotionnel

**Statut :** ⬜ En attente

> **Zone critique — couverture élevée requise (≥ 80%)**

Couvre : participation au jeu, limitation quotidienne, 2ème tentative, attribution des bons d'achat, limite de 10 gains/jour.

### Fichiers à créer

- [ ] `backend/src/__tests__/routes/game.test.ts`
- [ ] `frontend/src/__tests__/components/ScratchCard.test.tsx`

### Cas de test backend — `POST /game/play`

**Scénarios nominaux**
- [ ] 1ère tentative du jour — utilisateur non connecté → 401
- [ ] 1ère tentative valide → réponse avec `won`, `attempt: 1`, `canPlayAgain`
- [ ] 1ère tentative perdue → `canPlayAgain: true`, `attempt: 1`
- [ ] 2ème tentative après perte → `attempt: 2`, `canPlayAgain: false`
- [ ] Tentative gagnante avec lot disponible → `won: true`, `prize` non null, `voucherCode` au format `FOX-XXXXXXXX`

**Scénarios d'exception**
- [ ] 2 tentatives déjà utilisées → 400 `"Vous avez déjà utilisé vos deux tentatives aujourd'hui."`
- [ ] 1ère tentative gagnée → tentative de rejouer → 400 `"Vous avez déjà gagné aujourd'hui !"`

**Cas limites**
- [ ] 10 prix déjà distribués dans la journée → `won: false` même si tirage favorable (`prizesAvailable = false`)
- [ ] Tous les lots ont `claimed >= quantity` → `didWin = false` même si `won = true`
- [ ] `startOfDay()` est bien basé sur la date locale du serveur (mock de `Date`)

### Cas de test backend — `GET /game/status`

- [ ] Non connecté → 401
- [ ] Aucune partie jouée → `canPlay: true`, `attempt: 1`, `hasPlayed: false`
- [ ] 1 partie jouée (perdue) → `canPlay: true`, `attempt: 2`
- [ ] 1 partie jouée (gagnée) → `canPlay: false`
- [ ] 2 parties jouées → `canPlay: false`
- [ ] `prizesRemainingToday` est plafonné à 0 minimum (jamais négatif)

### Cas de test frontend — ScratchCard

- [ ] Le composant ne s'affiche pas (ou est désactivé) si l'utilisateur n'est pas connecté
- [ ] Affichage de l'état "peut jouer" si `canPlay: true`
- [ ] Affichage du résultat "gagné" avec le prix reçu
- [ ] Affichage du résultat "perdu" avec le message de 2ème chance
- [ ] Affichage du message "revenez demain" si plus de tentatives disponibles

---

## Phase 4 — Tests des fonctionnalités supplémentaires

**Statut :** ⬜ En attente

Couvre : parking, statistiques des visiteurs, gestion du contenu par collaborateurs.

### Fichiers à créer

- [ ] `backend/src/__tests__/routes/parking.test.ts`
- [ ] `backend/src/__tests__/routes/visitors.test.ts`
- [ ] `backend/src/__tests__/routes/prizes.test.ts`
- [ ] `frontend/src/__tests__/pages/ParkingsPage.test.tsx`

### Cas de test backend — Parking

- [ ] `GET /parking` → retourne la liste triée par nom (200)
- [ ] `PUT /parking/:id` avec EMPLOYEE → met à jour les places disponibles (200)
- [ ] `PUT /parking/:id` avec `availableSpaces < 0` → 400
- [ ] `PUT /parking/:id` avec id inexistant → 404
- [ ] `PUT /parking/:id` avec USER → 403
- [ ] `PUT /parking/:id` sans auth → 401

### Cas de test backend — Visiteurs

- [ ] `POST /visitors/track` enregistre une visite avec le chemin fourni
- [ ] `POST /visitors/track` sans chemin utilise `/` par défaut
- [ ] `GET /visitors/monthly` retourne le compteur du mois en cours (200, sans auth)
- [ ] `GET /visitors/stats` avec ADMIN → retourne `today`, `thisMonth`, `thisYear`, `total`, `dailyBreakdown` (200)
- [ ] `GET /visitors/stats` avec USER → 403
- [ ] `GET /visitors/stats` sans auth → 401

### Cas de test frontend — ParkingsPage

- [ ] La page affiche le nombre de places disponibles pour chaque parking
- [ ] Les données affichées correspondent aux données retournées par l'API (mock)
- [ ] Affichage cohérent entre `availableSpaces` et `totalSpaces`

---

## Phase 5 — Tests E2E Playwright

**Statut :** ⬜ En attente

> Prérequis : application en cours d'exécution en local (`make dev` ou équivalent)

### Fichiers à créer

- [ ] `e2e/auth.spec.ts` — Inscription et participation au jeu
- [ ] `e2e/game.spec.ts` — Règles métier du jeu (re-tentative, limite journalière)
- [ ] `e2e/shops.spec.ts` — Navigation boutiques et lien officiel
- [ ] `e2e/parking.spec.ts` — Consultation des parkings

### Scénarios E2E

- [ ] **auth.spec** : créer un compte → se connecter → accéder au jeu promotionnel → jouer
- [ ] **game.spec** : se connecter → jouer → tenter de rejouer dans la même journée → vérifier blocage
- [ ] **shops.spec** : naviguer vers la liste des boutiques → cliquer sur le lien officiel d'une boutique
- [ ] **parking.spec** : naviguer vers la page parking → vérifier l'affichage des places disponibles

### Test E2E manuel (à documenter séparément)

- [ ] Scénario documenté dans `e2e/README.md` : connexion → jeu → déconnexion

---

## Phase 6 — Documentation et couverture de code

**Statut :** ⬜ En attente

### Fichiers à créer

- [ ] `backend/src/__tests__/README.md` — prérequis, commandes, lecture des résultats
- [ ] `frontend/src/__tests__/README.md` — idem pour le frontend
- [ ] `e2e/README.md` — prérequis Playwright, `.env`, commandes, captures d'écran

### Couverture de code

- [ ] Lancer `npm run test:coverage` dans `backend/` → vérifier couverture ≥ 80% sur :
  - `src/routes/game.ts`
  - `src/middlewares/auth.ts`
  - `src/routes/auth.ts`
- [ ] Lancer `npm run test:coverage` dans `frontend/` → vérifier couverture sur :
  - `src/contexts/AuthContext.tsx`

### Vérification finale des objectifs du concept de tests

- [ ] **≥ 50 tests unitaires** au total (backend + frontend)
- [ ] **≥ 5 tests d'intégration** (couches réelles, fakes/stubs pour DB)
- [ ] **≥ 1 test E2E manuel** documenté
- [ ] **≥ 1 test E2E automatisé** Playwright passant en CI
- [ ] README fourni pour les 3 types de tests (unitaire, intégration, E2E)
