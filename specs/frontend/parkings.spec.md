# Spec : Page Parkings (frontend)

## Description
Affiche en temps réel le nombre de places disponibles dans les différentes zones de parking du centre commercial. Les données doivent être cohérentes et refléter les mises à jour des collaborateurs.

**Référence PDF** : §3.6 Parking

## Périmètre

| Composant / Fichier | Rôle |
|---|---|
| `pages/ParkingsPage.tsx` | Page d'affichage des parkings |
| `components/Skeleton.tsx` | État de chargement |

---

## Tests unitaires

**Outil** : Vitest + React Testing Library  
**Isolation** : mock `api.ts`

### Affichage

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-PARK-FE-01 | ✓ | Chargement | Skeleton affiché pendant le fetch |
| U-PARK-FE-02 | ✓ | Données nominales | Toutes les zones affichées avec nom, places disponibles, total |
| U-PARK-FE-03 | ✓ | Parking complet (0 places) | Indication visuelle "complet" (couleur, badge) |
| U-PARK-FE-04 | ✓ | Parking vide (toutes places libres) | Indication visuelle "libre" |
| U-PARK-FE-05 | ✓ | Parking partiel | Nombre de places disponibles affiché correctement |
| U-PARK-FE-06 | ✓ | Aucune zone de parking | Message ou liste vide gérée proprement |
| U-PARK-FE-07 | ✗ | Erreur API | Message d'erreur affiché, pas de crash |
| U-PARK-FE-08 | ✗ | Cohérence affichée | `availableSpaces` jamais supérieur à `totalSpaces` affiché |

### Mise à jour des données

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-PARK-FE-09 | ✓ | Rafraîchissement automatique | Si polling implémenté, données mises à jour sans rechargement |
| U-PARK-FE-10 | ✓ | Données périmées | Horodatage `updatedAt` affiché si présent |

---

## Tests d'intégration

**Outil** : Vitest + React Testing Library + MSW

| # | Scénario | Description |
|---|---|---|
| I-PARK-FE-01 | Fetch → affichage | API répond avec 3 zones → 3 cartes affichées avec les bonnes valeurs |
| I-PARK-FE-02 | Parking complet | `availableSpaces = 0` → indicateur "complet" visible |
| I-PARK-FE-03 | Route accessible publiquement | `/parkings` accessible sans authentification |

---

## Tests E2E

**Outil** : Playwright

| # | Parcours |
|---|---|
| E2E-PARK-FE-01 | Naviguer vers `/parkings` → voir les zones avec leur disponibilité |
| E2E-PARK-FE-02 | Vérifier l'affichage sur mobile (viewport 375px) |

---

## Données de test

```typescript
const parkingData = [
  { id: 1, name: 'Parking A', totalSpaces: 150, availableSpaces: 72, updatedAt: new Date() },
  { id: 2, name: 'Parking B', totalSpaces: 80, availableSpaces: 0, updatedAt: new Date() },
  { id: 3, name: 'Parking C', totalSpaces: 200, availableSpaces: 200, updatedAt: new Date() }
]
```

---

## Couverture attendue

**Niveau requis : moyen (>60%)**

- Indicateur visuel parking complet / disponible : 100%
- Gestion erreur API : 100%
- Cohérence des données affichées : 100%
