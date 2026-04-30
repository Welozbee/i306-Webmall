# Spec : Module Statistiques des visiteurs (frontend)

## Description
Affiche les statistiques de fréquentation du centre commercial aux collaborateurs et administrateurs. Présente les comptages journaliers, mensuels et annuels via des graphiques (Recharts). Le tracking automatique est géré par le `VisitorTracker` intégré dans `App.tsx`.

**Référence PDF** : §3.8 Statistiques des visiteurs

## Périmètre

| Composant / Fichier | Rôle |
|---|---|
| `pages/AdminPage.tsx` — section stats | Affichage des graphiques dans l'admin |
| `App.tsx` — `VisitorTracker` | Enregistrement automatique de chaque visite |
| `hooks/useCountUp.ts` | Animation des compteurs numériques |

---

## Tests unitaires

**Outil** : Vitest + React Testing Library  
**Isolation** : mock `api.ts`, fake horodatage

### Section statistiques dans AdminPage

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-STATS-01 | ✓ | Chargement | Skeleton ou spinner pendant le fetch |
| U-STATS-02 | ✓ | Statistiques journalières affichées | Graphique ou tableau avec données par jour |
| U-STATS-03 | ✓ | Statistiques mensuelles affichées | Comptage mensuel visible |
| U-STATS-04 | ✓ | Statistiques annuelles affichées | Comptage annuel visible |
| U-STATS-05 | ✓ | Aucune visite | Graphique vide ou message "aucune donnée" |
| U-STATS-06 | ✗ | Erreur API | Message d'erreur affiché, pas de crash |
| U-STATS-07 | ✗ | Section cachée pour USER | Statistiques non affichées si rôle USER |

### `VisitorTracker`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-STATS-08 | ✓ | Appel au montage | `POST /visitors/track` déclenché au chargement initial |
| U-STATS-09 | ✓ | Un seul appel par session | Navigation entre pages → pas de doublon de tracking |
| U-STATS-10 | ✓ | Path transmis correctement | `path` reflète la page actuelle (ex: `/boutiques`) |
| U-STATS-11 | ✗ | Erreur silencieuse | Échec de l'appel → page s'affiche sans erreur visible |

### `useCountUp`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-STATS-12 | ✓ | Animation de 0 à N | Valeur augmente progressivement jusqu'à la cible |
| U-STATS-13 | ✓ | Valeur 0 | Compteur reste à 0 sans animation |
| U-STATS-14 | ✓ | Changement de valeur cible | Animation repart depuis la valeur actuelle |

---

## Tests d'intégration

**Outil** : Vitest + React Testing Library + MSW

| # | Scénario | Description |
|---|---|---|
| I-STATS-01 | Stats chargées dans admin | `GET /visitors/stats` répond → graphiques affichés dans AdminPage |
| I-STATS-02 | Séparation journalier/mensuel/annuel | 3 périodes retournées → 3 sections ou onglets distincts |
| I-STATS-03 | EMPLOYEE voit les stats | Contexte EMPLOYEE → section stats visible |
| I-STATS-04 | USER ne voit pas les stats | Contexte USER → section stats absente |

---

## Tests E2E

**Outil** : Playwright

| # | Parcours |
|---|---|
| E2E-STATS-01 | Connexion ADMIN → `/admin` → section statistiques → vérifier présence de graphiques |
| E2E-STATS-02 | Naviguer sur plusieurs pages → vérifier que les visites sont bien enregistrées (via les stats admin) |

---

## Données de test

```typescript
// Mock API /visitors/stats
const dailyStats = [
  { date: '2026-03-01', count: 42 },
  { date: '2026-03-02', count: 87 },
  { date: '2026-03-03', count: 35 }
]
const monthlyStats = [
  { month: '2026-01', count: 1205 },
  { month: '2026-02', count: 980 },
  { month: '2026-03', count: 164 }
]
const annualStats = [
  { year: '2025', count: 14320 },
  { year: '2026', count: 2349 }
]

// Mock /visitors/monthly
const monthlyCount = { count: 164 }
```

---

## Couverture attendue

**Niveau requis : élevé (>80%)**  
Zone critique selon §5.4 : collecte des statistiques, stabilité des données affichées.

- Enregistrement de visite via VisitorTracker : 100%
- Affichage correct des 3 périodes (jour/mois/an) : 100%
- Accès restreint aux rôles EMPLOYEE/ADMIN : 100%
- Gestion d'erreur et absence de données : 100%
