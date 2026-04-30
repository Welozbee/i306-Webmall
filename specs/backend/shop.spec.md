# Spec : Module Boutiques (backend)

## Description
Gère le répertoire complet des magasins du centre commercial : affichage public, création/modification/suppression réservées aux collaborateurs (EMPLOYEE/ADMIN), et gestion des images (logo + galerie).

**Référence PDF** : §3.4 Liste des boutiques, §3.7 Gestion du contenu par les collaborateurs

## Périmètre

| Endpoint | Méthode | Accès | Rôle |
|---|---|---|---|
| `/shop/` | GET | Public | Lister toutes les boutiques |
| `/shop/:id` | GET | Public | Détail d'une boutique |
| `/shop/` | POST | EMPLOYEE/ADMIN | Créer une boutique |
| `/shop/:id` | PUT | EMPLOYEE/ADMIN | Modifier une boutique |
| `/shop/:id` | DELETE | EMPLOYEE/ADMIN | Supprimer une boutique |
| `/shop/:id/images` | GET | Public | Images d'une boutique |
| `/shop/:id/images` | POST | EMPLOYEE/ADMIN | Ajouter une image galerie |
| `/shop/:id/images/logo` | POST | EMPLOYEE/ADMIN | Uploader/remplacer le logo |

**Modèles Prisma concernés** : `Shop`, `ShopImage`

---

## Tests unitaires

**Outil** : Vitest  
**Isolation** : mock Prisma, mock multer (upload fichiers)

### `GET /shop/`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-SHOP-01 | ✓ | Boutiques présentes | Liste complète avec nom, étage, catégorie, URL, logo |
| U-SHOP-02 | ✓ | Aucune boutique en DB | Tableau vide `[]` |
| U-SHOP-03 | ✓ | Boutique sans URL externe | Champ `url` null ou vide, pas d'erreur |

### `GET /shop/:id`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-SHOP-04 | ✓ | ID valide existant | 200 + objet boutique complet |
| U-SHOP-05 | ✗ | ID inexistant | 404 |
| U-SHOP-06 | ✗ | ID invalide (non numérique) | 400 |

### `POST /shop/`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-SHOP-07 | ✓ | Création nominale par EMPLOYEE | 201, boutique enregistrée |
| U-SHOP-08 | ✓ | Création nominale par ADMIN | 201 |
| U-SHOP-09 | ✗ | Tentative par USER | 403 |
| U-SHOP-10 | ✗ | Sans token | 401 |
| U-SHOP-11 | ✗ | Champs obligatoires manquants | 400 |

### `PUT /shop/:id`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-SHOP-12 | ✓ | Modification nominale | 200, données mises à jour |
| U-SHOP-13 | ✓ | Mise à jour partielle | Champs non fournis inchangés |
| U-SHOP-14 | ✗ | ID inexistant | 404 |
| U-SHOP-15 | ✗ | Accès non autorisé (USER) | 403 |

### `DELETE /shop/:id`

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-SHOP-16 | ✓ | Suppression nominale par ADMIN | 200/204 |
| U-SHOP-17 | ✓ | Cascade sur ShopImage | Images associées supprimées automatiquement |
| U-SHOP-18 | ✗ | Accès non autorisé (USER) | 403 |
| U-SHOP-19 | ✗ | ID inexistant | 404 |

### Gestion des images

| # | Type | Cas | Résultat attendu |
|---|---|---|---|
| U-SHOP-20 | ✓ | Upload logo valide | `logoUrl` mis à jour sur le Shop |
| U-SHOP-21 | ✓ | Upload image galerie | Nouvelle entrée `ShopImage` créée |
| U-SHOP-22 | ✓ | Remplacement logo | Ancien `logoUrl` remplacé, pas de doublon |
| U-SHOP-23 | ✗ | Upload fichier non-image (PDF, exe) | 400 ou 415, type MIME refusé |
| U-SHOP-24 | ✗ | Upload image — boutique inexistante | 404 |
| U-SHOP-25 | ✗ | Upload image sans token | 401 |

---

## Tests d'intégration

**Outil** : Vitest + DB de test

| # | Scénario | Description |
|---|---|---|
| I-SHOP-01 | Création → lecture | Créer une boutique → `GET /shop/` la retourne avec toutes ses données |
| I-SHOP-02 | Modification → vérification | Modifier le nom → `GET /shop/:id` retourne le nouveau nom |
| I-SHOP-03 | Suppression → cascade | Supprimer boutique avec images → `ShopImage` supprimées en DB |
| I-SHOP-04 | Contrôle de rôle bout en bout | Token USER → POST /shop/ → 403, aucune entrée créée |

---

## Données de test

```typescript
const validShop = {
  name: 'Migros', floor: 0, category: 'Alimentation',
  storeNumber: 'A01', phone: '021 000 00 00',
  openingHours: 'Lun-Ven 9h-19h', url: 'https://migros.ch', logoUrl: null
}
const shopWithoutUrl = { ...validShop, url: null }
const employeeToken = '<JWT role=EMPLOYEE>'
const adminToken = '<JWT role=ADMIN>'
const userToken = '<JWT role=USER>'
```

---

## Couverture attendue

**Niveau requis : moyen (>60%)**

- Contrôles de rôle (403/401) : 100%
- Cascade de suppression : 100%
- Validation des champs obligatoires : 100%
- Validation du type MIME lors de l'upload : 100%
