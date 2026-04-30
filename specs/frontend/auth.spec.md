# Spec : Module Authentification (frontend)

## Description
Gère l'inscription, la connexion et la déconnexion côté interface. L'`AuthContext` maintient l'état de session global et expose les méthodes `login`, `register`, `logout`. La restriction d'accès au jeu sans connexion est contrôlée ici.

**Référence PDF** : §3.3 Gestion des comptes utilisateurs

## Périmètre

| Composant / Fichier | Rôle |
|---|---|
| `pages/LoginPage.tsx` | Formulaire de connexion |
| `pages/RegisterPage.tsx` | Formulaire d'inscription |
| `contexts/AuthContext.tsx` | État global de session |
| `lib/api.ts` | Gestion automatique du refresh token |

---

## Tests unitaires

**Outil** : Vitest + React Testing Library  
**Isolation** : mock `fetch` / `api.ts`, mock `localStorage`/`sessionStorage`

### `LoginPage`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-AUTH-FE-01 | ✓ | Rendu nominal | Champs email, mot de passe et bouton submit présents |
| U-AUTH-FE-02 | ✓ | Connexion réussie | Appel API → redirection vers la page précédente ou home |
| U-AUTH-FE-03 | ✗ | Identifiants incorrects | Message d'erreur affiché, pas de redirection |
| U-AUTH-FE-04 | ✗ | Champs vides | Validation HTML5 ou message d'erreur |
| U-AUTH-FE-05 | ✓ | Lien vers inscription | Présence d'un lien vers `/register` |
| U-AUTH-FE-06 | ✓ | État de chargement | Bouton désactivé pendant l'appel API |
| U-AUTH-FE-07 | ✗ | Erreur réseau (500) | Message d'erreur générique affiché, pas de crash |

### `RegisterPage`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-AUTH-FE-08 | ✓ | Rendu nominal | Champs email, mot de passe et bouton submit présents |
| U-AUTH-FE-09 | ✓ | Inscription réussie | Appel API → redirection ou message de succès |
| U-AUTH-FE-10 | ✗ | Email déjà utilisé | Message d'erreur affiché (ex: "Email déjà utilisé") |
| U-AUTH-FE-11 | ✗ | Mot de passe invalide | Message de validation affiché |
| U-AUTH-FE-12 | ✓ | Lien vers connexion | Présence d'un lien vers `/login` |

### `AuthContext`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-AUTH-FE-13 | ✓ | État initial | `user = null`, `isAuthenticated = false` |
| U-AUTH-FE-14 | ✓ | Après login | `user` renseigné, `isAuthenticated = true` |
| U-AUTH-FE-15 | ✓ | Après logout | `user = null`, tokens supprimés du stockage |
| U-AUTH-FE-16 | ✓ | Persistance de session | Rechargement de page → session restaurée si token valide |

### `api.ts` — Gestion du refresh token

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-AUTH-FE-17 | ✓ | Requête avec token valide | Réponse normale transmise |
| U-AUTH-FE-18 | ✓ | Requête avec token expiré | Refresh automatique → requête rejouée avec nouveau token |
| U-AUTH-FE-19 | ✗ | Refresh échoué | Déconnexion automatique, redirection vers `/login` |

---

## Tests d'intégration

**Outil** : Vitest + React Testing Library + MSW

| # | Scénario | Description |
|---|---|---|
| I-AUTH-FE-01 | Formulaire login → contexte | Login réussi → `AuthContext` mis à jour → Navbar affiche l'utilisateur |
| I-AUTH-FE-02 | Accès protégé sans session | Naviguer vers `/admin` sans être connecté → redirection vers `/login` |
| I-AUTH-FE-03 | Refresh automatique | Token expiré simulé → `api.ts` rafraîchit et complète la requête |

---

## Tests E2E

**Outil** : Playwright

| # | Parcours |
|---|---|
| E2E-AUTH-FE-01 | Remplir le formulaire d'inscription → connexion → accès au jeu visible |
| E2E-AUTH-FE-02 | Accéder à `/admin` sans être connecté → rediriger vers `/login` |
| E2E-AUTH-FE-03 | Se connecter → se déconnecter → jeu plus accessible |

---

## Données de test

```typescript
const validCredentials = { email: 'user@webmall.ch', password: 'Password123!' }
const invalidCredentials = { email: 'user@webmall.ch', password: 'mauvais' }
const loginSuccessResponse = { accessToken: '<jwt>', refreshToken: '<jwt>' }
const loginErrorResponse = { error: 'Identifiants incorrects' }
```

---

## Couverture attendue

**Niveau requis : élevé (>80%)**  
Zone critique selon §5.4 : authentification.

- Affichage des erreurs d'authentification : 100%
- Logique de refresh token dans `api.ts` : 100%
- Restriction d'accès selon état de connexion : 100%
