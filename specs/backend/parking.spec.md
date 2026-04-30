# Spec : Module Parking (backend)

## Description
Affiche le nombre de places disponibles dans les différentes zones de parking du centre. La mise à jour est réservée aux collaborateurs. Les données doivent être cohérentes (places disponibles ≤ places totales).

**Référence PDF** : §3.6 Parking

## Périmètre

| Endpoint | Méthode | Accès | Rôle |
|---|---|---|---|
| `/parking/` | GET | Public | Lister toutes les zones de parking |
| `/parking/:id` | PUT | EMPLOYEE/ADMIN | Mettre à jour les places disponibles |

**Modèle Prisma concerné** : `Parking`

---

## Tests unitaires

**Outil** : Vitest  
**Isolation** : mock Prisma

### `GET /parking/`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-PARK-01 | ✓ | Zones présentes | Liste des zones avec `name`, `totalSpaces`, `availableSpaces`, `updatedAt` |
| U-PARK-02 | ✓ | Aucune zone en DB | Tableau vide `[]` |
| U-PARK-03 | ✓ | Accès sans authentification | 200 (endpoint public) |

### `PUT /parking/:id`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-PARK-04 | ✓ | Mise à jour nominale par EMPLOYEE | 200, `availableSpaces` mis à jour |
| U-PARK-05 | ✓ | Mise à jour nominale par ADMIN | 200 |
| U-PARK-06 | ✗ | Tentative par USER | 403 |
| U-PARK-07 | ✗ | Sans token | 401 |
| U-PARK-08 | ✗ | ID inexistant | 404 |
| U-PARK-09 | ✗ | `availableSpaces` > `totalSpaces` | 400, cohérence des données |
| U-PARK-10 | ✗ | `availableSpaces` < 0 | 400 |
| U-PARK-11 | ✓ | `availableSpaces` = 0 (parking plein) | 200, valeur acceptée |
| U-PARK-12 | ✓ | `availableSpaces` = `totalSpaces` (parking vide) | 200, valeur acceptée |
| U-PARK-13 | ✗ | `availableSpaces` non entier (ex: `5.7`) | 400, type invalide |
| U-PARK-14 | ✗ | Body vide | 400, champ requis manquant |

---

## Tests d'intégration

**Outil** : Vitest + DB de test

| # | Scénario | Description |
|---|---|---|
| I-PARK-01 | Mise à jour → lecture | Modifier `availableSpaces` → `GET /parking/` reflète la nouvelle valeur |
| I-PARK-02 | Contrôle de rôle | Token USER → `PUT /parking/:id` → 403, aucune modification en DB |
| I-PARK-03 | Cohérence des données | Tenter `availableSpaces = totalSpaces + 1` → rejeté, DB inchangée |

---

## Données de test

```typescript
const parkingZone = { id: 1, name: 'Parking A', totalSpaces: 100, availableSpaces: 45 }
const fullParking = { ...parkingZone, availableSpaces: 0 }
const emptyParking = { ...parkingZone, availableSpaces: 100 }
```

---

## Couverture attendue

**Niveau requis : moyen (>60%)**

- Règles de cohérence (disponible ≤ total, ≥ 0) : 100%
- Contrôles de rôle : 100%
