# Spec : Module Gestion des lots (backend)

## Description
Permet à l'administrateur de gérer le pool de bons d'achat distribuables par le jeu promotionnel. Le module contrôle quels lots sont actifs, leur quantité et leur taux de distribution.

**Référence PDF** : §3.2 Jeu promotionnel (attribution correcte des bons d'achat)

## Périmètre

| Endpoint | Méthode | Accès | Rôle |
|---|---|---|---|
| `/prizes/` | GET | ADMIN | Lister tous les lots |
| `/prizes/` | POST | ADMIN | Créer un lot |
| `/prizes/generate` | POST | ADMIN | Générer des lots aléatoires |
| `/prizes/:id` | PUT | ADMIN | Modifier un lot |
| `/prizes/:id` | DELETE | ADMIN | Supprimer un lot |

**Modèle Prisma concerné** : `Prize`

---

## Tests unitaires

**Outil** : Vitest  
**Isolation** : mock Prisma

### `GET /prizes/`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-PRI-01 | ✓ | Liste nominale | 200, tous les lots avec `claimed`/`quantity`/`active` |
| U-PRI-02 | ✓ | Aucun lot en DB | 200, tableau vide `[]` |
| U-PRI-03 | ✗ | Accès non ADMIN | 403 |
| U-PRI-04 | ✗ | Sans token | 401 |

### `POST /prizes/`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-PRI-05 | ✓ | Création nominale | 201, lot créé avec `claimed = 0`, `active = true` |
| U-PRI-06 | ✗ | Champs obligatoires manquants | 400 |
| U-PRI-07 | ✗ | `quantity` ≤ 0 | 400 |
| U-PRI-08 | ✗ | Accès non ADMIN | 403 |

### `PUT /prizes/:id`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-PRI-09 | ✓ | Désactivation d'un lot (`active: false`) | 200, lot non sélectionné lors du jeu |
| U-PRI-10 | ✓ | Augmentation de quantité | 200, `quantity` mis à jour |
| U-PRI-11 | ✗ | `quantity` < `claimed` actuel | 400 (on ne peut pas réduire en dessous du déjà distribué) |
| U-PRI-12 | ✗ | ID inexistant | 404 |
| U-PRI-13 | ✗ | Accès non ADMIN | 403 |

### `DELETE /prizes/:id`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-PRI-14 | ✓ | Suppression nominale | 200/204 |
| U-PRI-15 | ✗ | Lot déjà utilisé dans des `GamePlay` | 400 ou suppression logique selon implémentation |
| U-PRI-16 | ✗ | ID inexistant | 404 |
| U-PRI-17 | ✗ | Sans token | 401 |

### `POST /prizes/generate`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-PRI-18 | ✓ | Génération nominale | Lots créés avec valeurs aléatoires cohérentes |
| U-PRI-19 | ✗ | Accès non ADMIN | 403 |
| U-PRI-20 | ✗ | Sans token | 401 |

---

## Tests d'intégration

**Outil** : Vitest + DB de test

| # | Scénario | Description |
|---|---|---|
| I-PRI-01 | Création → jeu | Créer un lot actif → `/game/play` peut l'attribuer |
| I-PRI-02 | Désactivation → jeu | Désactiver un lot → `/game/play` ne l'attribue plus |
| I-PRI-03 | Épuisement → jeu | `claimed = quantity` sur tous les lots → `/game/play` ne distribue plus rien |

---

## Données de test

```typescript
const activePrize = { name: 'Bon Migros', description: '50 CHF', shopName: 'Migros', quantity: 10, claimed: 0, active: true }
const inactivePrize = { ...activePrize, active: false }
const exhaustedPrize = { ...activePrize, quantity: 5, claimed: 5 }
const partialPrize = { ...activePrize, quantity: 10, claimed: 3 }
```

---

## Couverture attendue

**Niveau requis : élevé (>80%)**  
Zone critique selon §5.4 : attribution des cadeaux.

- Logique de sélection de lot actif et non épuisé : 100%
- Contrôle ADMIN only : 100%
- Invariant `claimed ≤ quantity` : 100%
