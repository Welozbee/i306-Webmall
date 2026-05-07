# Frontend — i306 Webmall

React 19 + Vite + TypeScript + Tailwind CSS.

Voir le [README principal](../README.md) pour le démarrage, le déploiement et la vue d'ensemble des tests.

---

## Développement

```bash
npm install
npm run dev        # serveur de développement (http://localhost:5173)
npm run build      # build de production
npm run lint       # ESLint
```

Le proxy Vite redirige `/api/*` vers `http://backend:3000` (configuré dans `vite.config.ts`).

---

## Tests unitaires

```bash
npm run test:run      # exécution unique
npm test              # mode watch
npm run test:coverage # rapport de couverture (seuil : 60 %)
```

Fichiers de test : `src/**/*.test.{ts,tsx}`
Setup global : `src/test/setup.ts` (mocks `IntersectionObserver` et `EventSource`)

## Tests E2E

```bash
npm run test:e2e      # Playwright headless
npm run test:e2e:ui   # Playwright avec interface graphique
```

Fichiers : `e2e/*.spec.ts`
Navigateur : Chromium (installer avec `sudo npx playwright install --with-deps chromium`)
