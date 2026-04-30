# Spec : Module Jeu Promotionnel (frontend)

## Description
Interface du jeu de grattage permettant aux utilisateurs connectés de tenter de gagner des bons d'achat. Comprend la carte à gratter interactive (`ScratchCard`), la bannière de victoire (`WinBanner`), et la page historique des gains (`RewardsPage`).

**Référence PDF** : §3.2 Jeu promotionnel, §3.1 Page d'accueil (accessibilité du jeu)

## Périmètre

| Composant / Fichier | Rôle |
|---|---|
| `components/ScratchCard.tsx` | Carte à gratter interactive |
| `components/WinBanner.tsx` | Bannière affichée en cas de victoire |
| `components/Confetti.tsx` | Animation de confettis sur victoire |
| `pages/RewardsPage.tsx` | Historique des gains de l'utilisateur |

---

## Tests unitaires

**Outil** : Vitest + React Testing Library  
**Isolation** : mock `api.ts`, mock `AuthContext`

### `ScratchCard`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-GAME-FE-01 | ✓ | Rendu — utilisateur connecté | Carte à gratter affichée et interactive |
| U-GAME-FE-02 | ✗ | Rendu — utilisateur non connecté | Message d'invitation à se connecter (pas de carte) |
| U-GAME-FE-03 | ✗ | `canPlay: false` (déjà joué) | Carte désactivée ou message "déjà joué aujourd'hui" |
| U-GAME-FE-04 | ✓ | Victoire | `WinBanner` et `Confetti` affichés après résultat positif |
| U-GAME-FE-05 | ✓ | Défaite — première tentative | Message "réessayer" / 2e chance proposée |
| U-GAME-FE-06 | ✓ | Défaite — deuxième tentative | Message "fin des tentatives" affiché |
| U-GAME-FE-07 | ✓ | `voucherCode` affiché | Code bon d'achat visible après victoire (format `FOX-XXXXXXXX`) |
| U-GAME-FE-08 | ✓ | Chargement du statut | Skeleton ou spinner pendant l'appel `GET /game/status` |
| U-GAME-FE-09 | ✗ | Erreur API `/game/play` | Message d'erreur affiché, carte non bloquée définitivement |
| U-GAME-FE-10 | ✗ | Limite 10 gains atteinte | Message informatif "aucun lot disponible" |
| U-GAME-FE-11 | ✗ | Erreur réseau pendant `/game/play` | Pas de crash, carte toujours utilisable après reconnexion |

### `WinBanner`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-GAME-FE-12 | ✓ | Rendu avec prix | Nom du prix et code bon affiché |
| U-GAME-FE-13 | ✗ | Rendu sans prix (défaite) | Composant non affiché ou caché |

### `RewardsPage`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-GAME-FE-14 | ✓ | Chargement | Skeleton affiché |
| U-GAME-FE-15 | ✓ | Gains présents | Liste des bons avec code, date, nom du lot |
| U-GAME-FE-16 | ✓ | Aucun gain | Message "vous n'avez pas encore gagné" |
| U-GAME-FE-17 | ✗ | Non connecté | Redirection vers `/login` ou message |
| U-GAME-FE-18 | ✗ | Erreur API | Message d'erreur, pas de crash |

---

## Tests d'intégration

**Outil** : Vitest + React Testing Library + MSW

| # | Scénario | Description |
|---|---|---|
| I-GAME-FE-01 | Statut → affichage carte | `GET /game/status` répond `canPlay: true` → carte grattable |
| I-GAME-FE-02 | Jouer → victoire → WinBanner | `POST /game/play` répond `won: true` → WinBanner avec code affiché |
| I-GAME-FE-03 | Jouer → défaite → 2e chance | `attempt: 1`, `won: false` → carte rechargée pour 2e tentative |
| I-GAME-FE-04 | Déjà joué | `canPlay: false` → carte désactivée à l'affichage |
| I-GAME-FE-05 | Auth guard | Accès à `/rewards` sans token → redirection `/login` |

---

## Tests E2E

**Outil** : Playwright

| # | Parcours |
|---|---|
| E2E-GAME-FE-01 | Connexion → home → gratter → voir résultat (victoire ou défaite) |
| E2E-GAME-FE-02 | Connexion → jouer → naviguer vers `/rewards` → voir l'historique |
| E2E-GAME-FE-03 | Connexion → jouer deux fois → troisième tentative bloquée avec message |

---

## Données de test

```typescript
// Mock API responses
const statusCanPlay = { canPlay: true, attempts: 0 }
const statusCantPlay = { canPlay: false, attempts: 2 }
const statusSecondChance = { canPlay: true, attempts: 1 }

const winResult = { won: true, attempt: 1, prize: 'Bon Migros 50 CHF', voucherCode: 'FOX-ABCD1234' }
const loseResult = { won: false, attempt: 1, prize: null, voucherCode: null }

const rewardsList = [
  { id: 1, prize: 'Bon Migros 50 CHF', voucherCode: 'FOX-ABCD1234', playedAt: '2026-03-15' }
]
```

---

## Couverture attendue

**Niveau requis : élevé (>80%)**  
Zone critique selon §5.4 : règles métier du jeu, limitations quotidiennes.

- Affichage conditionnel selon `canPlay` et `attempts` : 100%
- Affichage du `voucherCode` après victoire : 100%
- Restriction d'accès sans authentification : 100%
- Gestion des deux tentatives : 100%
- Résilience aux erreurs réseau : 100%
