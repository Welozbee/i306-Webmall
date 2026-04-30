# Spec : Module Authentification (backend)

## Description
Gère la création de comptes, la connexion, le renouvellement de session et la déconnexion. Module critique : toute participation au jeu est conditionnée à une session valide.

**Référence PDF** : §3.3 Gestion des comptes utilisateurs, §5.4 Couverture de code

## Périmètre

| Endpoint | Méthode | Rôle |
|---|---|---|
| `/auth/register` | POST | Création de compte |
| `/auth/login` | POST | Connexion, retourne access + refresh token |
| `/auth/refresh` | POST | Rotation du refresh token |
| `/auth/logout` | POST | Révocation du token |

**Modèles Prisma concernés** : `User`, `RefreshToken`

---

## Tests unitaires

**Outil** : Vitest  
**Isolation** : mock Prisma, mock bcryptjs, mock jsonwebtoken, fake horodatage

### `POST /auth/register`

| # | Type | Cas | Entrée | Résultat attendu |
|---|---|---|---|---|
| U-AUTH-01 | ✓ | Inscription nominale | email valide + mot de passe ≥8 chars | 201, user créé en DB, mot de passe haché |
| U-AUTH-02 | ✗ | Email déjà utilisé | email existant | 409, message d'erreur explicite |
| U-AUTH-03 | ✗ | Email invalide | `notanemail` | 400, validation rejetée |
| U-AUTH-04 | ✗ | Mot de passe trop court | `abc` | 400, validation rejetée |
| U-AUTH-05 | ✗ | Champs manquants | body vide | 400 |
| U-AUTH-06 | ✓ | Rôle par défaut | inscription normale | `role = USER` en DB |

### `POST /auth/login`

| # | Type | Cas | Entrée | Résultat attendu |
|---|---|---|---|---|
| U-AUTH-07 | ✓ | Connexion nominale | email + password corrects | 200, `accessToken` + `refreshToken` |
| U-AUTH-08 | ✗ | Mot de passe incorrect | bon email, mauvais mdp | 401 |
| U-AUTH-09 | ✗ | Utilisateur inexistant | email inconnu | 401 (pas de fuite d'information) |
| U-AUTH-10 | ✓ | Refresh token stocké haché | connexion réussie | token stocké avec hash bcrypt, jamais en clair |

### `POST /auth/refresh`

| # | Type | Cas | Entrée | Résultat attendu |
|---|---|---|---|---|
| U-AUTH-11 | ✓ | Rotation nominale | refresh token valide | 200, nouveau pair de tokens |
| U-AUTH-12 | ✗ | Token révoqué | token avec `revokedAt` non null | 401 |
| U-AUTH-13 | ✗ | Token expiré | token avec `expiresAt` dépassé | 401 |
| U-AUTH-14 | ✗ | Token inconnu | hash inexistant en DB | 401 |
| U-AUTH-15 | ✓ | Ancien token révoqué après rotation | rotation réussie | ancien token marqué `revokedAt` |
| U-AUTH-16 | ✗ | Token malformé | chaîne non-JWT (ex: `"abc"`) | 401 |
| U-AUTH-17 | ✗ | Body vide | aucun token fourni | 400 |

### `POST /auth/logout`

| # | Type | Cas | Entrée | Résultat attendu |
|---|---|---|---|---|
| U-AUTH-18 | ✓ | Déconnexion nominale | refresh token valide | 200, token révoqué en DB |
| U-AUTH-19 | ✗ | Déjà déconnecté | token déjà révoqué | 200 ou 401 (comportement idempotent) |

---

## Tests d'intégration

**Outil** : Vitest + base de données de test (PostgreSQL test ou SQLite via Prisma)

| # | Scénario | Description |
|---|---|---|
| I-AUTH-01 | Inscription → Connexion | Créer un compte puis se connecter avec les mêmes identifiants → tokens valides |
| I-AUTH-02 | Connexion → Refresh → Logout | Flux complet de session : connexion, rotation de token, déconnexion |
| I-AUTH-03 | Accès protégé sans token | Appel à `/game/play` sans header `Authorization` → 401 |
| I-AUTH-04 | Accès protégé avec token expiré | Accès avec accessToken périmé → 401, inciter au refresh |
| I-AUTH-05 | Restriction de rôle | Utilisateur `USER` appelle `GET /users/` → 403 |

---

## Tests E2E

**Outil** : Playwright

| # | Parcours |
|---|---|
| E2E-AUTH-01 | Inscription via UI → redirection → connexion → accès au jeu |
| E2E-AUTH-02 | Tentative d'accès au jeu sans être connecté → redirection vers `/login` |

---

## Données de test

```typescript
// Fixtures recommandées
const validUser = { email: 'test@webmall.ch', password: 'Password123!' }
const existingUser = { email: 'exists@webmall.ch', passwordHash: '<bcrypt>' }
const expiredRefreshToken = { tokenHash: '<hash>', expiresAt: new Date('2000-01-01') }
const revokedRefreshToken = { tokenHash: '<hash>', revokedAt: new Date() }
```

---

## Couverture attendue

**Niveau requis : élevé (>80%)**  
Zone critique selon §5.4 du PDF : authentification, gestion des sessions.

- Hachage du mot de passe : 100%
- Logique de validation des tokens : 100%
- Rotation et révocation des refresh tokens : 100%
