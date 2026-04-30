# Spec : Page Administration / Gestion du contenu (frontend)

## Description
Interface permettant aux collaborateurs (EMPLOYEE/ADMIN) de gérer le contenu du site sans connaissances techniques : ajout/modification de boutiques, gestion des lots, mise à jour des parkings, et gestion des utilisateurs (ADMIN uniquement).

**Référence PDF** : §3.7 Gestion du contenu par les collaborateurs

## Périmètre

| Composant / Fichier | Rôle |
|---|---|
| `pages/AdminPage.tsx` | Interface d'administration centralisée |
| `contexts/AuthContext.tsx` | Contrôle d'accès basé sur le rôle |

---

## Tests unitaires

**Outil** : Vitest + React Testing Library  
**Isolation** : mock `api.ts`, mock `AuthContext`

### Contrôle d'accès

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-ADMIN-01 | ✓ | Accès par ADMIN | Page complète affichée (boutiques, lots, users, parking) |
| U-ADMIN-02 | ✓ | Accès par EMPLOYEE | Page affichée avec sections autorisées (boutiques, parking), sections admin masquées |
| U-ADMIN-03 | ✗ | Accès par USER | Redirection vers `/` ou page 403 |
| U-ADMIN-04 | ✗ | Sans token | Redirection vers `/login` |

### Gestion des boutiques

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-ADMIN-05 | ✓ | Liste des boutiques | Toutes les boutiques affichées dans le panneau admin |
| U-ADMIN-06 | ✓ | Formulaire d'ajout | Formulaire de création de boutique présent et soumis |
| U-ADMIN-07 | ✓ | Soumission valide | Appel `POST /shop/`, boutique ajoutée à la liste |
| U-ADMIN-08 | ✗ | Soumission invalide | Erreurs de validation affichées inline |
| U-ADMIN-09 | ✓ | Modification d'une boutique | Formulaire pré-rempli, `PUT /shop/:id` appelé |
| U-ADMIN-10 | ✓ | Suppression d'une boutique | Confirmation demandée, `DELETE /shop/:id` appelé |
| U-ADMIN-11 | ✓ | Upload de logo | Input fichier présent, appel `POST /shop/:id/images/logo` |
| U-ADMIN-12 | ✗ | API échoue lors de la création | Erreur affichée inline, formulaire non réinitialisé |
| U-ADMIN-13 | ✓ | Annulation de la suppression | Dialog annulé → boutique non supprimée, aucun appel API |
| U-ADMIN-14 | ✗ | Upload d'un type de fichier invalide | Message d'erreur, pas d'appel API |

### Gestion des lots (ADMIN)

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-ADMIN-15 | ✓ | Liste des lots | `claimed`/`quantity`/`active` affichés |
| U-ADMIN-16 | ✓ | Désactiver un lot | Toggle `active`, appel `PUT /prizes/:id` |
| U-ADMIN-17 | ✓ | Créer un lot | Formulaire soumis → `POST /prizes/` |
| U-ADMIN-18 | ✗ | Masqué pour EMPLOYEE | Section lots non visible pour EMPLOYEE |

### Gestion des utilisateurs (ADMIN)

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-ADMIN-19 | ✓ | Liste des utilisateurs | Email et rôle affichés, jamais le mot de passe |
| U-ADMIN-20 | ✓ | Changer le rôle | Sélecteur de rôle, appel `PUT /users/:id/role` |
| U-ADMIN-21 | ✗ | Masqué pour EMPLOYEE | Section utilisateurs non visible pour EMPLOYEE |

### Gestion des parkings

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-ADMIN-22 | ✓ | Mise à jour places disponibles | Champ numérique, appel `PUT /parking/:id` |
| U-ADMIN-23 | ✗ | Valeur incohérente | Erreur si saisie > total ou < 0 |

---

## Tests d'intégration

**Outil** : Vitest + React Testing Library + MSW

| # | Scénario | Description |
|---|---|---|
| I-ADMIN-01 | Ajout boutique → liste mise à jour | Formulaire soumis → boutique apparaît dans la liste sans rechargement |
| I-ADMIN-02 | EMPLOYEE ne voit pas la gestion users | Contexte EMPLOYEE → section utilisateurs absente du DOM |
| I-ADMIN-03 | USER redirigé | Context USER → redirection immédiate hors de `/admin` |

---

## Tests E2E

**Outil** : Playwright

| # | Parcours |
|---|---|
| E2E-ADMIN-01 | Connexion EMPLOYEE → `/admin` → ajouter une boutique → vérifier qu'elle apparaît dans `/boutiques` |
| E2E-ADMIN-02 | Connexion USER → tenter `/admin` → redirection ou accès refusé |

---

## Données de test

```typescript
const adminUser = { id: 1, email: 'admin@webmall.ch', role: 'ADMIN' }
const employeeUser = { id: 2, email: 'employee@webmall.ch', role: 'EMPLOYEE' }
const regularUser = { id: 3, email: 'user@webmall.ch', role: 'USER' }

const newShopForm = { name: 'Zara', floor: 1, category: 'Mode', storeNumber: 'B12' }
```

---

## Couverture attendue

**Niveau requis : moyen (>60%)**

- Contrôle d'accès par rôle (USER/EMPLOYEE/ADMIN) : 100%
- Visibilité conditionnelle des sections selon le rôle : 100%
- Validation des formulaires : 100%
- Résilience aux erreurs API (formulaire conservé) : 100%
