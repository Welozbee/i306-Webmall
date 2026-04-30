# Spec : Module Statistiques des visiteurs (backend)

## Description
Enregistre anonymement les visites de pages et expose des statistiques agrégées (journalières, mensuelles, annuelles) aux administrateurs/employés. Le comptage public retourne uniquement le total mensuel.

**Référence PDF** : §3.8 Statistiques des visiteurs, §5.4 Couverture de code

## Périmètre

| Endpoint | Méthode | Accès | Rôle |
|---|---|---|---|
| `/visitors/track` | POST | Public | Enregistrer une visite |
| `/visitors/monthly` | GET | Public | Total mensuel (simple) |
| `/visitors/stats` | GET | EMPLOYEE/ADMIN | Statistiques détaillées |

**Modèle Prisma concerné** : `VisitorLog`

---

## Tests unitaires

**Outil** : Vitest  
**Isolation** : mock Prisma, fake horodatage

### `POST /visitors/track`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-VIS-01 | ✓ | Enregistrement nominal | 200/201, entrée `VisitorLog` créée avec `path` et `visitedAt` |
| U-VIS-02 | ✓ | Path par défaut | body sans `path` → `path = "/"` enregistré |
| U-VIS-03 | ✓ | Path personnalisé | `path = "/boutiques"` → enregistré tel quel |
| U-VIS-04 | ✓ | Sans authentification | 200 (endpoint public, anonyme) |
| U-VIS-05 | ✓ | Plusieurs visites indépendantes | Chaque appel crée une entrée distincte (pas de déduplication) |
| U-VIS-06 | ✗ | Path trop long (> 255 chars) | 400 ou troncature selon implémentation, pas de crash |

### `GET /visitors/monthly`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-VIS-07 | ✓ | Mois courant avec visites | Nombre correct de visites du mois en cours |
| U-VIS-08 | ✓ | Aucune visite ce mois | 0 retourné |
| U-VIS-09 | ✓ | Visites d'autres mois exclues | Seules les visites du mois courant comptées |

### `GET /visitors/stats`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-VIS-10 | ✓ | Statistiques journalières | Comptage par jour pour la période demandée |
| U-VIS-11 | ✓ | Statistiques mensuelles | Comptage par mois |
| U-VIS-12 | ✓ | Statistiques annuelles | Comptage par année |
| U-VIS-13 | ✓ | Filtrage par période | Dates hors période exclues |
| U-VIS-14 | ✗ | Accès par USER | 403 |
| U-VIS-15 | ✗ | Sans token | 401 |
| U-VIS-16 | ✗ | Dates invalides (ex: `from=abc`) | 400, paramètre non parsable |
| U-VIS-17 | ✗ | Date de fin antérieure à la date de début | 400, plage incohérente |

---

## Tests d'intégration

**Outil** : Vitest + DB de test

| # | Scénario | Description |
|---|---|---|
| I-VIS-01 | Track → monthly | Insérer 5 visites → `GET /visitors/monthly` retourne 5 |
| I-VIS-02 | Isolation mensuelle | Visites d'il y a 2 mois → non comptées dans le mois courant |
| I-VIS-03 | Stats détaillées | Visites sur 3 jours → stats journalières correctes par date |
| I-VIS-04 | Contrôle de rôle | Token USER → `/visitors/stats` → 403 |

---

## Données de test

```typescript
const todayVisits = Array(3).fill({ path: '/', visitedAt: new Date() })
const lastMonthVisits = Array(5).fill({ path: '/boutiques', visitedAt: lastMonth })
const yesterdayVisits = Array(2).fill({ path: '/plan', visitedAt: yesterday })
const longPath = 'a'.repeat(300)
```

---

## Couverture attendue

**Niveau requis : élevé (>80%)**  
Zone critique selon §5.4 : collecte des statistiques, stabilité des données affichées.

- Logique d'agrégation (jour/mois/an) : 100%
- Isolation temporelle (bonne période) : 100%
- Enregistrement anonyme : 100%
