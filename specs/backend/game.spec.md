# Spec : Module Jeu Promotionnel (backend)

## Description
Cœur métier du site : permet aux utilisateurs connectés de tenter de gagner des bons d'achat une fois par jour (avec une seconde chance en cas d'échec). Limité à 10 gains distribués par jour. Module le plus critique du projet.

**Référence PDF** : §3.2 Jeu promotionnel, §4.1 Tests unitaires, §5.4 Couverture de code

## Périmètre

| Endpoint | Méthode | Rôle |
|---|---|---|
| `/game/play` | POST | Exécuter une tentative de jeu |
| `/game/status` | GET | Statut du jour (tentatives, gains) |
| `/game/rewards` | GET | Historique des gains de l'utilisateur |
| `/game/wins/stream` | GET | SSE — notifications en temps réel des gains |

**Modèles Prisma concernés** : `GamePlay`, `Prize`, `User`

---

## Tests unitaires

**Outil** : Vitest  
**Isolation** : mock Prisma, mock horodatage (`Date.now()`), mock générateur aléatoire (taux de gain 30%)

### Règles métier — `POST /game/play`

| # | Type | Cas | Précondition | Résultat attendu |
|---|---|---|---|---|
| U-GAME-01 | ✓ | Jeu nominal — première tentative gagnante | user connecté, 0 tentative du jour, lots disponibles | 200, `won: true`, `voucherCode` généré (format `FOX-XXXXXXXX`) |
| U-GAME-02 | ✓ | Jeu nominal — première tentative perdante | user connecté, 0 tentative du jour | 200, `won: false`, `attempt: 1` |
| U-GAME-03 | ✓ | Deuxième tentative autorisée après échec | `attempt: 1` perdant en DB | 200, deuxième tentative traitée |
| U-GAME-04 | ✗ | Deuxième tentative refusée après victoire | `attempt: 1` gagnant en DB | 400/403, pas de troisième chance |
| U-GAME-05 | ✗ | Refus si déjà joué deux fois | 2 tentatives en DB ce jour | 403, limite atteinte |
| U-GAME-06 | ✗ | Refus si 10 gains distribués aujourd'hui | 10 `GamePlay` avec `won: true` ce jour | 200 ou 403 selon implémentation, aucun lot attribué |
| U-GAME-07 | ✗ | Non-connecté | pas de token | 401 |
| U-GAME-08 | ✗ | Attribution d'un lot actif uniquement | lots avec `active: false` uniquement | lot non sélectionné, comportement selon implémentation |
| U-GAME-09 | ✓ | Format du code bon d'achat | tentative gagnante | `voucherCode` correspond au regex `FOX-[A-Z0-9]{8}` |
| U-GAME-10 | ✓ | Incrémentation du compteur `claimed` | gain attribué | `Prize.claimed` incrémenté de 1 |

### `GET /game/status`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-GAME-11 | ✓ | Aucune tentative aujourd'hui | `attempts: 0`, `canPlay: true` |
| U-GAME-12 | ✓ | Une tentative perdante | `attempts: 1`, `canPlay: true` (2e chance) |
| U-GAME-13 | ✓ | Deux tentatives effectuées | `attempts: 2`, `canPlay: false` |
| U-GAME-14 | ✓ | Limite journalière reset à minuit | tentative hier, aujourd'hui = 0 → `canPlay: true` |
| U-GAME-15 | ✗ | Sans token | 401 |

### `GET /game/rewards`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-GAME-16 | ✓ | Aucun gain | liste vide `[]` |
| U-GAME-17 | ✓ | Gains passés | liste des `GamePlay` avec `won: true` de l'utilisateur |
| U-GAME-18 | ✗ | Gains d'un autre utilisateur non visibles | isolation par `userId` — résultat filtré |
| U-GAME-19 | ✗ | Sans token | 401 |

---

## Tests d'intégration

**Outil** : Vitest + DB de test

| # | Scénario | Description |
|---|---|---|
| I-GAME-01 | Flux jeu complet — victoire | User connecté → `/game/status` → `/game/play` → gain → `/game/rewards` contient le gain |
| I-GAME-02 | Flux jeu complet — seconde chance | Première tentative perdue → `/game/play` une 2e fois → résultat enregistré |
| I-GAME-03 | Limite 10 gains/jour | Insérer 10 `GamePlay` gagnants du jour en DB → appel `/game/play` → aucun lot attribué |
| I-GAME-04 | Isolation par utilisateur | User A joue 2 fois → User B peut toujours jouer |
| I-GAME-05 | Jeu + auth | Appel `/game/play` avec token invalide → 401, aucun enregistrement créé |

---

## Tests E2E

**Outil** : Playwright

| # | Parcours |
|---|---|
| E2E-GAME-01 | Création de compte → connexion → gratter la carte → affichage résultat |
| E2E-GAME-02 | Connexion → jouer → tenter de rejouer dans la même journée → message de blocage |

---

## Données de test

```typescript
// Fixtures
const noPlaysToday = []
const oneFailedPlay = [{ attempt: 1, won: false, playedAt: today }]
const twoPlays = [{ attempt: 1, won: false }, { attempt: 2, won: false }]
const tenWinsToday = Array(10).fill({ won: true, playedAt: today })
const activePrize = { name: 'Bon Migros 50CHF', quantity: 10, claimed: 0, active: true }
const exhaustedPrize = { name: 'Bon Migros 50CHF', quantity: 10, claimed: 10, active: true }
const inactivePrize = { name: 'Bon Migros 50CHF', quantity: 10, claimed: 0, active: false }
```

---

## Couverture attendue

**Niveau requis : élevé (>90%)**  
Zone la plus critique selon §5.4 : règles métier du jeu, limitations quotidiennes, attribution des cadeaux.

- Logique de limitation (1 participation/jour, max 10 gains) : 100%
- Attribution et format du voucherCode : 100%
- Gestion de la 2e tentative : 100%
- Reset quotidien : 100%
