# Spec : Module Boutiques (frontend)

## Description
Affiche la liste complète des magasins du centre commercial avec liens vers leurs sites officiels. La page de détail présente les informations complètes d'une boutique (horaires, téléphone, images, localisation).

**Référence PDF** : §3.4 Liste des boutiques

## Périmètre

| Composant / Fichier | Rôle |
|---|---|
| `pages/BoutiquesPage.tsx` | Liste de toutes les boutiques |
| `pages/BoutiqueDetailPage.tsx` | Détail d'une boutique |
| `components/Skeleton.tsx` | État de chargement |
| `hooks/useFavorites.ts` | Gestion des favoris |

---

## Tests unitaires

**Outil** : Vitest + React Testing Library  
**Isolation** : mock `api.ts`

### `BoutiquesPage`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-BOUT-01 | ✓ | Chargement — état skeleton | Composant `Skeleton` affiché pendant le fetch |
| U-BOUT-02 | ✓ | Affichage nominal | Toutes les boutiques affichées avec nom, catégorie, étage |
| U-BOUT-03 | ✓ | Boutique avec URL externe | Lien externe présent et pointe vers la bonne URL |
| U-BOUT-04 | ✓ | Boutique sans URL externe | Pas de lien brisé, UI cohérente |
| U-BOUT-05 | ✓ | Lien externe en nouvel onglet | `target="_blank"` et `rel="noopener noreferrer"` |
| U-BOUT-06 | ✓ | Aucune boutique | Message "aucune boutique" ou liste vide gérée |
| U-BOUT-07 | ✗ | Erreur API | Message d'erreur affiché, pas de crash |
| U-BOUT-08 | ✓ | Lien vers détail | Clic sur une boutique → navigation vers `/boutiques/:id` |

### `BoutiqueDetailPage`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-BOUT-09 | ✓ | Chargement initial | Skeleton affiché |
| U-BOUT-10 | ✓ | Affichage des informations | Nom, étage, catégorie, téléphone, horaires affichés |
| U-BOUT-11 | ✓ | Logo affiché | Image logo chargée si `logoUrl` présent |
| U-BOUT-12 | ✓ | Logo absent | Placeholder affiché, pas d'image cassée |
| U-BOUT-13 | ✓ | Galerie d'images | Images de la galerie rendues |
| U-BOUT-14 | ✓ | Lien vers site officiel | Bouton/lien vers `url` externe de la boutique |
| U-BOUT-15 | ✗ | ID boutique inexistant | Message 404 ou redirection |
| U-BOUT-16 | ✓ | Statut d'ouverture | `OpeningStatus` affiché avec l'heure actuelle |
| U-BOUT-17 | ✗ | Erreur de chargement du détail | Message d'erreur affiché, pas de crash |

### `useFavorites`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-BOUT-18 | ✓ | Ajouter aux favoris | Boutique ajoutée, persistée (localStorage) |
| U-BOUT-19 | ✓ | Retirer des favoris | Boutique retirée |
| U-BOUT-20 | ✓ | Favoris persistants | Rechargement de page → favoris restaurés |

---

## Tests d'intégration

**Outil** : Vitest + React Testing Library + MSW

| # | Scénario | Description |
|---|---|---|
| I-BOUT-01 | Liste → détail | Clic sur boutique → navigation → détail chargé |
| I-BOUT-02 | Lien externe fonctionnel | Attributs de sécurité (`rel`, `target`) présents sur les liens externes |
| I-BOUT-03 | Skeleton → contenu | API répond → skeleton remplacé par les données réelles |

---

## Tests E2E

**Outil** : Playwright

| # | Parcours |
|---|---|
| E2E-BOUT-01 | Naviguer vers `/boutiques` → voir la liste → cliquer sur une boutique → voir son détail |
| E2E-BOUT-02 | Cliquer sur le lien vers le site officiel d'un magasin → nouvel onglet ouvert |

---

## Données de test

```typescript
const shopList = [
  { id: 1, name: 'Migros', floor: 0, category: 'Alimentation', url: 'https://migros.ch', logoUrl: '/logos/migros.png' },
  { id: 2, name: 'H&M', floor: 1, category: 'Mode', url: null, logoUrl: null }
]
const shopDetail = {
  ...shopList[0],
  phone: '021 000 00 00', openingHours: 'Lun-Sam 9h-19h',
  images: [{ id: 1, url: '/images/migros-1.jpg' }]
}
```

---

## Couverture attendue

**Niveau requis : moyen (>60%)**

- Affichage des liens externes avec attributs de sécurité : 100%
- Gestion boutique sans URL / sans logo : 100%
- Cas 404 (boutique inconnue) : 100%
