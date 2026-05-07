# Tests E2E manuels — i306 Webmall

Ce document recense les cas de test end-to-end exécutés manuellement. Il complète la suite automatisée Playwright (`frontend/e2e/`).

---

## E2E-GAME-MANUEL-01 — Jeu de la carte à gratter (parcours complet)

**Fonctionnalité** : Jeu promotionnel — inscription → grattage → résultat → récompenses → déconnexion

### Prérequis

| Élément | Valeur |
|---|---|
| Application | Démarrée via `make dev` |
| URL | `http://localhost:5173` |
| Base de données | Opérationnelle, sans partie jouée aujourd'hui pour le compte de test |
| Compte de test | Inexistant (création pendant le test) |

### Données de test

| Champ | Valeur |
|---|---|
| Email | `manuel-test@webmall.ch` |
| Mot de passe | `Test1234!` |

### Informations d'exécution

| Champ | À compléter |
|---|---|
| Testeur | |
| Date | |
| Navigateur | |
| Version de l'app (git) | |
| Résultat global | ☐ PASSÉ &nbsp; ☐ ÉCHOUÉ |

---

### Étapes

| # | Action | Données saisies | Résultat attendu | Résultat obtenu | Statut |
|---|---|---|---|---|---|
| 1 | Ouvrir `http://localhost:5173` | — | Page d'accueil affichée, bouton **Se connecter** visible dans la navbar | | ☐ |
| 2 | Cliquer sur **Se connecter** dans la navbar | — | Redirection vers `/login`, formulaire email + mot de passe visible | | ☐ |
| 3 | Cliquer sur le lien **Créer un compte** | — | Redirection vers `/register`, formulaire d'inscription affiché | | ☐ |
| 4 | Remplir le formulaire et cliquer sur **Créer mon compte** | Email : `manuel-test@webmall.ch` / MDP : `Test1234!` / Confirmation : `Test1234!` | Redirection vers `/`, email affiché dans la navbar, section jeu visible avec le bouton **Gratter ma carte !** et le nombre de cadeaux disponibles | | ☐ |
| 5 | Cliquer sur **Gratter ma carte !** | — | La carte à gratter (canvas grisé) apparaît à l'écran | | ☐ |
| 6 | Maintenir le clic gauche enfoncé et déplacer la souris sur toute la surface de la carte | Mouvements couvrant > 50 % de la surface | La zone grise disparaît progressivement, révélant le résultat en dessous | | ☐ |
| 7 | Observer le résultat affiché après grattage complet | — | **Victoire** : message de félicitations + code bon d'achat (ex. `FOX-XXXX1234`) affiché / **Défaite** : message indiquant qu'on n'a pas gagné | | ☐ |
| 8 | *(Victoire uniquement)* Cliquer sur **Mes récompenses** dans la navbar | — | Redirection vers `/rewards`, le bon gagné est listé avec son code, le nom du lot et la date | | ☐ / N/A |
| 9 | *(Victoire uniquement)* Cliquer sur l'icône de copie à côté du code | — | Notification "Copié !" affichée, code copié dans le presse-papier | | ☐ / N/A |
| 10 | Revenir sur la page d'accueil (`/`) | — | La section jeu affiche **"Vous avez déjà joué aujourd'hui"** — le bouton **Gratter ma carte !** est absent | | ☐ |
| 11 | Cliquer sur son email dans la navbar puis **Déconnexion** | — | Redirection vers `/`, section jeu affiche **"Connectez-vous pour participer"**, aucun email dans la navbar | | ☐ |

---

### Critères de succès

Le cas est **PASSÉ** si toutes les étapes applicables obtiennent le résultat attendu sans erreur console critique (niveau `error`).

### Classification des défauts

| Symptôme observé | Sévérité |
|---|---|
| Crash ou page blanche à n'importe quelle étape | Bloquant |
| Le canvas ne réagit pas aux mouvements de souris | Majeur |
| Le résultat n'est pas affiché après grattage complet | Majeur |
| Le code bon d'achat n'apparaît pas en cas de victoire | Majeur |
| Le bouton **Gratter ma carte !** reste visible après avoir joué | Mineur |
| La copie du code dans le presse-papier ne fonctionne pas | Mineur |

---

### Lien avec les tests automatisés

Ce cas manuel couvre le même parcours que les scénarios Playwright suivants :

| Cas manuel | Cas automatisé équivalent |
|---|---|
| Étapes 1–7 (grattage + victoire) | `E2E-GAME-FE-01` — `frontend/e2e/game.spec.ts` |
| Étapes 8–9 (récompenses) | `E2E-GAME-FE-02` — `frontend/e2e/game.spec.ts` |
| Étape 10 (quota épuisé) | `E2E-GAME-FE-03` — `frontend/e2e/game.spec.ts` |

Les tests automatisés interceptent les appels API (`page.route()`) pour être reproductibles sans backend. Ce test manuel valide le comportement sur l'infrastructure réelle.
