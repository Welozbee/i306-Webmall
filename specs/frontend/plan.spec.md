# Spec : Page Plan du centre (frontend)

## Description
Affiche le plan interactif ou statique du centre commercial pour aider les visiteurs à s'orienter. Doit être accessible depuis le site et compatible avec différents types d'appareils.

**Référence PDF** : §3.5 Plan du centre commercial

## Périmètre

| Composant / Fichier | Rôle |
|---|---|
| `pages/PlanPage.tsx` | Page du plan du centre |

---

## Tests unitaires

**Outil** : Vitest + React Testing Library

### Affichage du plan

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-PLAN-01 | ✓ | Rendu nominal | Page rendue sans erreur |
| U-PLAN-02 | ✓ | Plan affiché | Élément image ou SVG du plan présent dans le DOM |
| U-PLAN-03 | ✓ | Titre de la page | Titre ou en-tête identifiant la page "Plan" visible |
| U-PLAN-04 | ✓ | Lien depuis la navbar | Lien `/plan` présent dans la navigation |
| U-PLAN-05 | ✓ | Plan chargé dynamiquement | Si chargement async : skeleton affiché puis plan rendu |
| U-PLAN-06 | ✗ | Erreur de chargement | Si le plan ne charge pas : message d'erreur affiché, pas de crash |

### Responsive

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-PLAN-07 | ✓ | Viewport mobile (375px) | Plan visible et non tronqué (scroll ou zoom possible) |
| U-PLAN-08 | ✓ | Viewport tablette (768px) | Plan affiché correctement |
| U-PLAN-09 | ✓ | Viewport desktop (1440px) | Plan affiché en taille normale |

---

## Tests d'intégration

| # | Scénario | Description |
|---|---|---|
| I-PLAN-01 | Navigation depuis la navbar | Cliquer sur "Plan" dans la nav → route `/plan` → page rendue |
| I-PLAN-02 | Accessibilité de la route | Route `/plan` accessible sans authentification |

---

## Tests E2E

**Outil** : Playwright

| # | Parcours |
|---|---|
| E2E-PLAN-01 | Naviguer vers `/plan` → plan visible à l'écran |
| E2E-PLAN-02 | Ouvrir sur mobile (viewport 375×667) → plan lisible sans superposition |
| E2E-PLAN-03 | Ouvrir sur tablette (viewport 768×1024) → plan affiché correctement |

---

## Données de test

```typescript
// Pas de données API spécifiques — le plan est généralement une image statique ou un SVG
// Mock si le plan est chargé via API :
const planImageUrl = '/assets/plan-centre.svg'
```

---

## Couverture attendue

**Niveau requis : faible à moyen (>40%)**

- Présence du plan dans le DOM : 100%
- Gestion d'erreur si le plan ne charge pas : 100%
- Tests responsive couverts par E2E Playwright
