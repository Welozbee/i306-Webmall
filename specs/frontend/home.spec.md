# Spec : Page d'accueil (frontend)

## Description
Point d'entrée du site. Affiche les informations principales du centre commercial, intègre l'accès au jeu promotionnel (ScratchCard) et enregistre chaque visite via le `VisitorTracker`.

**Référence PDF** : §3.1 Page d'accueil

## Périmètre

| Composant / Fichier | Rôle |
|---|---|
| `pages/HomePage.tsx` | Page principale |
| `components/ScratchCard.tsx` | Widget du jeu (accès depuis la home) |
| `App.tsx` — `VisitorTracker` | Tracking automatique des visites |
| `components/Navbar.tsx` | Navigation globale |
| `components/Footer.tsx` | Pied de page |

---

## Tests unitaires

**Outil** : Vitest + React Testing Library  
**Isolation** : mock `fetch` / `api.ts`, mock `AuthContext`

### Affichage de la page

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-HOME-01 | ✓ | Rendu nominal | Page rendue sans erreur, titre du centre visible |
| U-HOME-02 | ✓ | Informations principales affichées | Nom du centre, horaires ou infos clés présents dans le DOM |
| U-HOME-03 | ✓ | Navbar présente | Liens de navigation rendus |
| U-HOME-04 | ✓ | Footer présent | Footer rendu en bas de page |

### Accès au jeu

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-HOME-05 | ✓ | Utilisateur connecté | Lien/bouton vers le jeu visible et actif |
| U-HOME-06 | ✗ | Utilisateur non connecté | Message ou lien invitant à se connecter pour jouer |
| U-HOME-07 | ✓ | ScratchCard rendu | Composant ScratchCard présent dans la page |

### VisitorTracker

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-HOME-08 | ✓ | Tracking au montage | `POST /visitors/track` appelé lors du premier rendu |
| U-HOME-09 | ✓ | Tracking une seule fois par session | Deuxième rendu (navigation retour) → pas de second appel |
| U-HOME-10 | ✗ | Erreur de tracking silencieuse | Échec de l'appel API → pas de crash, page s'affiche normalement |

---

## Tests d'intégration

**Outil** : Vitest + React Testing Library + MSW (mock service worker)

| # | Scénario | Description |
|---|---|---|
| I-HOME-01 | Home + Auth | Utilisateur connecté → jeu accessible ; utilisateur déconnecté → invitation à se connecter |
| I-HOME-02 | Home + Tracking | Navigation sur la home → appel `POST /visitors/track` intercepté et vérifié |

---

## Tests E2E

**Outil** : Playwright

| # | Parcours |
|---|---|
| E2E-HOME-01 | Ouvrir le site → vérifier titre, navbar, footer et accès au jeu |
| E2E-HOME-02 | Vérifier que la page s'affiche correctement sur mobile (viewport 375px) |

---

## Données de test

```typescript
// Mock AuthContext
const loggedInUser = { id: 1, email: 'user@webmall.ch', role: 'USER' }
const noUser = null

// Mock API
const trackingResponse = { success: true }
```

---

## Couverture attendue

**Niveau requis : moyen (>60%)**

- Affichage conditionnel selon l'état de connexion : 100%
- Appel de tracking au montage : 100%
