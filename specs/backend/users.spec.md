# Spec : Module Gestion des utilisateurs (backend)

## Description
Permet à l'administrateur de consulter la liste des utilisateurs et de modifier leurs rôles. Réservé exclusivement au rôle ADMIN.

**Référence PDF** : §3.3 Gestion des comptes utilisateurs, §3.7 Gestion du contenu

## Périmètre

| Endpoint | Méthode | Accès | Rôle |
|---|---|---|---|
| `/users/` | GET | ADMIN | Lister tous les utilisateurs |
| `/users/:id/role` | PUT | ADMIN | Modifier le rôle d'un utilisateur |

**Modèle Prisma concerné** : `User`

---

## Tests unitaires

**Outil** : Vitest  
**Isolation** : mock Prisma, mock JWT

### `GET /users/`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-USR-01 | ✓ | Liste nominale par ADMIN | 200, liste des utilisateurs (sans `passwordHash`) |
| U-USR-02 | ✗ | Accès par EMPLOYEE | 403 |
| U-USR-03 | ✗ | Accès par USER | 403 |
| U-USR-04 | ✗ | Sans token | 401 |
| U-USR-05 | ✓ | `passwordHash` absent de la réponse | Champ sensible non exposé |
| U-USR-06 | ✓ | Aucun utilisateur en DB | `[]` |

### `PUT /users/:id/role`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-USR-07 | ✓ | Promotion USER → EMPLOYEE | 200, rôle mis à jour |
| U-USR-08 | ✓ | Promotion USER → ADMIN | 200, rôle mis à jour |
| U-USR-09 | ✓ | Rétrogradation ADMIN → USER | 200 |
| U-USR-10 | ✗ | Rôle invalide | 400 (valeurs acceptées : USER, EMPLOYEE, ADMIN) |
| U-USR-11 | ✗ | ID utilisateur inexistant | 404 |
| U-USR-12 | ✗ | Accès par EMPLOYEE | 403 |
| U-USR-13 | ✗ | Accès par USER | 403 |
| U-USR-14 | ✗ | Sans token | 401 |
| U-USR-15 | ✗ | Admin modifie son propre rôle | 400 ou 403 (protection contre auto-rétrogradation) |
| U-USR-16 | ✗ | `:id` non numérique (ex: `"abc"`) | 400, paramètre invalide |

---

## Tests d'intégration

**Outil** : Vitest + DB de test

| # | Scénario | Description |
|---|---|---|
| I-USR-01 | Promotion puis vérification | Changer rôle USER → EMPLOYEE → l'utilisateur peut maintenant créer des boutiques |
| I-USR-02 | Liste sans données sensibles | `GET /users/` → aucun `passwordHash` dans la réponse |
| I-USR-03 | Contrôle strict ADMIN only | EMPLOYEE tente `PUT /users/:id/role` → 403 |

---

## Données de test

```typescript
const adminToken = '<JWT role=ADMIN>'
const employeeToken = '<JWT role=EMPLOYEE>'
const userToken = '<JWT role=USER>'
const targetUser = { id: 5, email: 'target@webmall.ch', role: 'USER' }
```

---

## Couverture attendue

**Niveau requis : moyen (>60%)**

- Restriction ADMIN only (403/401) : 100%
- Non-exposition du passwordHash : 100%
- Validation des valeurs de rôle : 100%
