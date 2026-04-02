# Instructions pour agents IA — Implémentation des tests WebMall

> Ce document est destiné à des agents IA chargés d'implémenter le concept de tests du projet WebMall (FoxTown).  
> Lis entièrement ce document avant de commencer. Respecte l'ordre des phases.

---

## Architecture du projet

```
i306-2/
├── backend/                         # Node.js + Express 5 + TypeScript + Prisma
│   ├── src/
│   │   ├── index.ts                 # Point d'entrée (app.listen — NE PAS MODIFIER)
│   │   ├── prisma.ts                # Instance Prisma (à mocker dans les tests)
│   │   ├── routes/
│   │   │   ├── auth.ts              # POST /auth/register|login|logout|refresh
│   │   │   ├── game.ts              # GET|POST /game/play|status|rewards
│   │   │   ├── shop.ts              # GET|POST|PUT|DELETE /shop
│   │   │   ├── parking.ts           # GET|PUT /parking
│   │   │   ├── visitors.ts          # POST /visitors/track, GET /visitors/stats|monthly
│   │   │   └── prizes.ts            # Gestion des lots
│   │   ├── middlewares/
│   │   │   ├── auth.ts              # authenticate() + authorize()
│   │   │   └── logger.ts
│   │   └── events/
│   │       └── winEvents.ts         # SSE pour les gains (NE PAS MOCKER dans tests normaux)
│   ├── prisma/
│   │   └── schema.prisma            # Modèles : User, GamePlay, Prize, Parking, VisitorLog, etc.
│   ├── generated/prisma/            # Client Prisma généré (NE PAS MODIFIER)
│   └── package.json                 # type: "module" — ESM
├── frontend/                        # React 19 + Vite + TypeScript
│   ├── src/
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx      # Auth state, login/register/logout, isEmployee
│   │   ├── pages/                   # HomePage, LoginPage, BoutiquesPage, ParkingsPage, etc.
│   │   ├── components/              # ScratchCard, Navbar, Footer, etc.
│   │   └── lib/
│   │       └── api.ts               # apiFetch() — à mocker dans les tests frontend
│   └── package.json                 # type: "module" — ESM
├── e2e/                             # Tests E2E Playwright (à créer)
├── playwright.config.ts             # Config Playwright (à créer)
└── PLAN.md                          # Plan d'implémentation avec statuts
```

---

## Règles métier critiques (à bien comprendre avant d'écrire les tests)

### Jeu promotionnel (`backend/src/routes/game.ts`)

```
MAX_PRIZES_PER_DAY = 10
WIN_PROBABILITY    = 0.3 (30%)
```

**Règles POST /game/play :**
1. Nécessite authentification (Bearer JWT) — sinon 401
2. Maximum **2 tentatives par jour** par utilisateur
3. Si la 1ère tentative est **gagnée** → la 2ème est **bloquée** (400)
4. Si la 1ère tentative est **perdue** → la 2ème est autorisée
5. Si 10 prizes ont déjà été distribués dans la journée → `won` forcé à `false`
6. Un lot n'est attribué que si `active = true` ET `claimed < quantity`
7. Code voucher format : `FOX-` + 4 octets hex majuscules (ex: `FOX-A3F2C1B0`)
8. `canPlayAgain = !won && attempt === 1`

**Règles GET /game/status :**
- `canPlay = todaysPlays.length === 0 || (length === 1 && firstPlay.won === false)`
- `prizesRemainingToday = Math.max(0, 10 - todaysPrizeCount)` — jamais négatif

### Authentification (`backend/src/routes/auth.ts` + `middlewares/auth.ts`)

- Email validé : doit contenir `@` et `.`
- Mot de passe minimum : 8 caractères
- Email stocké en minuscules
- Token JWT : `{ sub: userId.toString(), role, email }`, expiration configurable
- Refresh token : stocké haché (SHA256), durée 7 jours par défaut
- `authenticate` : extrait Bearer token, hydrate `req.user = { id, role, email }`
- `authorize(...roles)` : vérifie `req.user.role` ∈ roles — sinon 403

### Visitors (`backend/src/routes/visitors.ts`)

- `POST /visitors/track` : accessible sans auth, enregistre `path` (défaut `/`)
- `GET /visitors/monthly` : accessible sans auth
- `GET /visitors/stats` : réservé aux rôles `EMPLOYEE` et `ADMIN`

### Parking (`backend/src/routes/parking.ts`)

- `GET /parking` : accessible sans auth
- `PUT /parking/:id` : réservé aux rôles `EMPLOYEE` et `ADMIN`
- Validation : `availableSpaces` et `totalSpaces` doivent être ≥ 0

### Shops (`backend/src/routes/shop.ts`)

- `GET /shop` et `GET /shop/:id` : accessibles sans auth
- `POST`, `PUT`, `DELETE` : réservés aux rôles `EMPLOYEE` et `ADMIN`
- `GET /shop/:id` avec id non numérique → 400

---

## Phase 0 — Setup de l'infrastructure

### 1. Installation des dépendances

```bash
# Dans backend/
cd backend
npm install -D vitest @vitest/coverage-v8 supertest @types/supertest

# Dans frontend/
cd ../frontend
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom

# À la racine pour Playwright
cd ..
npm init -y  # si pas de package.json racine, sinon skip
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

### 2. Fichier `backend/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/index.ts',
        'src/prisma.ts',
        'src/__tests__/**',
      ],
    },
  },
})
```

### 3. Fichier `frontend/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/__tests__/**', 'src/main.tsx'],
    },
  },
})
```

### 4. Fichier `backend/src/__tests__/setup.ts`

```typescript
import { vi, afterEach } from 'vitest'

// Réinitialise tous les mocks entre chaque test
afterEach(() => {
  vi.clearAllMocks()
})
```

### 5. Fichier `frontend/src/__tests__/setup.ts`

```typescript
import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  localStorage.clear()
})
```

### 6. Fichier `backend/.env.test`

```env
JWT_SECRET=test-secret-key-for-vitest
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_TTL_DAYS=7
DATABASE_URL=postgresql://test:test@localhost:5432/webmall_test
PORT=3001
```

### 7. Mise à jour des scripts dans `backend/package.json`

Remplace la ligne `"test"` par :
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

Même chose dans `frontend/package.json`.

### 8. Fichier `playwright.config.ts` (racine)

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Lance l'application avant les tests E2E (optionnel selon l'environnement)
  // webServer: {
  //   command: 'make dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: true,
  // },
})
```

### 9. Pattern de mock Prisma à réutiliser dans tous les tests backend

```typescript
// En haut de chaque fichier de test backend
import { vi } from 'vitest'

vi.mock('../../prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    gamePlay: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    prize: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    parking: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    visitorLog: {
      create: vi.fn(),
      count: vi.fn(),
    },
    shop: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}))
```

> **Chemin du mock :** le chemin relatif depuis le fichier de test vers `prisma.ts`.  
> Depuis `src/__tests__/routes/game.test.ts` → `'../../prisma'`  
> Depuis `src/__tests__/middlewares/auth.test.ts` → `'../../prisma'`

### 10. Helper pour créer un JWT de test valide

À placer dans `backend/src/__tests__/helpers.ts` :

```typescript
import jwt from 'jsonwebtoken'

const TEST_SECRET = 'test-secret-key-for-vitest'

export function makeAccessToken(payload: {
  sub: string
  role: 'USER' | 'EMPLOYEE' | 'ADMIN'
  email: string
}) {
  return jwt.sign(payload, TEST_SECRET, { expiresIn: '1h' })
}

export const testUser = {
  id: 1,
  email: 'test@example.com',
  role: 'USER' as const,
}

export const testEmployee = {
  id: 2,
  email: 'employee@example.com',
  role: 'EMPLOYEE' as const,
}

export const testAdmin = {
  id: 3,
  email: 'admin@example.com',
  role: 'ADMIN' as const,
}
```

### 11. Helper pour créer une app Express de test

À placer dans `backend/src/__tests__/testApp.ts` :

```typescript
import express from 'express'
import authRouter from '../routes/auth'
import gameRouter from '../routes/game'
import shopRouter from '../routes/shop'
import parkingRouter from '../routes/parking'
import visitorsRouter from '../routes/visitors'

// Crée une instance Express minimale pour les tests (sans app.listen)
export function createTestApp() {
  const app = express()
  app.use(express.json())
  app.use('/auth', authRouter)
  app.use('/game', gameRouter)
  app.use('/shop', shopRouter)
  app.use('/parking', parkingRouter)
  app.use('/visitors', visitorsRouter)
  return app
}
```

> Utilise `supertest(createTestApp())` dans tous les tests de routes.

---

## Phase 1 — Tests boutiques et page d'accueil

### Fichier `backend/src/__tests__/routes/shop.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { createTestApp } from '../testApp'
import prisma from '../../prisma'

vi.mock('../../prisma', () => ({ /* voir pattern ci-dessus */ }))

const prismaMock = prisma as any
const app = createTestApp()

const mockShop = {
  id: 1,
  name: 'Nike',
  floor: 1,
  category: 'Sport',
  storeNumber: 'A01',
  phone: '021 000 00 00',
  openingHours: '10h-19h',
  url: 'https://nike.com',
  logoUrl: '/logos/nike.png',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('GET /shop', () => {
  it('retourne un tableau de boutiques (200)', async () => {
    prismaMock.shop.findMany.mockResolvedValue([mockShop])
    const res = await request(app).get('/shop')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0].name).toBe('Nike')
  })

  it('retourne un tableau vide si aucune boutique', async () => {
    prismaMock.shop.findMany.mockResolvedValue([])
    const res = await request(app).get('/shop')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('GET /shop/:id', () => {
  it('retourne la boutique pour un id valide (200)', async () => {
    prismaMock.shop.findUnique.mockResolvedValue(mockShop)
    const res = await request(app).get('/shop/1')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(1)
  })

  it('retourne 400 pour un id non numérique', async () => {
    const res = await request(app).get('/shop/abc')
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid shop id')
  })

  it('retourne 404 si la boutique n\'existe pas', async () => {
    prismaMock.shop.findUnique.mockResolvedValue(null)
    const res = await request(app).get('/shop/999')
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Shop not found')
  })
})
```

### Fichier `frontend/src/__tests__/pages/BoutiquesPage.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BoutiquesPage from '../../pages/BoutiquesPage'

// Mocker l'API
vi.mock('../../lib/api', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '../../lib/api'
const apiFetchMock = apiFetch as ReturnType<typeof vi.fn>

const mockShops = [
  {
    id: 1,
    name: 'Nike',
    floor: 1,
    category: 'Sport',
    url: 'https://nike.com',
    logoUrl: '/logos/nike.png',
    openingHours: '10h-19h',
    storeNumber: 'A01',
    phone: '',
  },
  {
    id: 2,
    name: 'Boutique Sans URL',
    floor: 2,
    category: 'Mode',
    url: '',
    logoUrl: '',
    openingHours: '09h-18h',
    storeNumber: 'B02',
    phone: '',
  },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <BoutiquesPage />
    </MemoryRouter>
  )
}

describe('BoutiquesPage', () => {
  beforeEach(() => {
    apiFetchMock.mockResolvedValue(mockShops)
  })

  it('affiche la liste des boutiques après chargement', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Nike')).toBeInTheDocument())
    expect(screen.getByText('Boutique Sans URL')).toBeInTheDocument()
  })

  it('affiche un lien vers le site officiel si url est renseignée', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Nike'))
    const link = screen.getByRole('link', { name: /site officiel|nike/i })
    expect(link).toHaveAttribute('href', 'https://nike.com')
  })

  it('n\'affiche pas de lien si url est vide', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Boutique Sans URL'))
    // Vérifie qu'aucun lien ne pointe vers une url vide
    const links = screen.queryAllByRole('link')
    links.forEach(link => {
      expect(link).not.toHaveAttribute('href', '')
    })
  })
})
```

---

## Phase 2 — Tests authentification

### Fichier `backend/src/__tests__/routes/auth.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import { createTestApp } from '../testApp'
import prisma from '../../prisma'

vi.mock('../../prisma', () => ({ /* voir pattern ci-dessus */ }))

const prismaMock = prisma as any
const app = createTestApp()

// Données de test
const existingUser = {
  id: 1,
  email: 'user@example.com',
  passwordHash: bcrypt.hashSync('password123', 10),
  role: 'USER',
}

// Important : définir JWT_SECRET avant les tests
process.env.JWT_SECRET = 'test-secret-key-for-vitest'

describe('POST /auth/register', () => {
  beforeEach(() => {
    prismaMock.user.create.mockResolvedValue({ id: 1, email: 'new@example.com', role: 'USER' })
    prismaMock.refreshToken.create.mockResolvedValue({})
  })

  it('inscription valide → 201 avec accessToken et refreshToken', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'new@example.com',
      password: 'password123',
    })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('accessToken')
    expect(res.body).toHaveProperty('refreshToken')
    expect(res.body.user.email).toBe('new@example.com')
  })

  it('email manquant → 400', async () => {
    const res = await request(app).post('/auth/register').send({ password: 'password123' })
    expect(res.status).toBe(400)
  })

  it('mot de passe manquant → 400', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'a@b.com' })
    expect(res.status).toBe(400)
  })

  it('email sans @ → 400', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'invalide',
      password: 'password123',
    })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Invalid email')
  })

  it('mot de passe < 8 caractères → 400', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'a@b.com',
      password: 'court',
    })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/8 characters/)
  })

  it('email déjà utilisé → 409', async () => {
    const { Prisma } = await import('../../generated/prisma/client')
    const dupError = new Prisma.PrismaClientKnownRequestError('Unique', {
      code: 'P2002',
      clientVersion: '7',
    })
    prismaMock.user.create.mockRejectedValue(dupError)
    const res = await request(app).post('/auth/register').send({
      email: 'existing@example.com',
      password: 'password123',
    })
    expect(res.status).toBe(409)
    expect(res.body.error).toBe('Email already exists')
  })
})

describe('POST /auth/login', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockResolvedValue(existingUser)
    prismaMock.refreshToken.create.mockResolvedValue({})
  })

  it('connexion valide → 200 avec tokens', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('accessToken')
    expect(res.body).toHaveProperty('refreshToken')
  })

  it('mauvais mot de passe → 401', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'user@example.com',
      password: 'wrongpassword',
    })
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Invalid credentials')
  })

  it('email inconnu → 401', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    const res = await request(app).post('/auth/login').send({
      email: 'nobody@example.com',
      password: 'password123',
    })
    expect(res.status).toBe(401)
  })

  it('champs manquants → 400', async () => {
    const res = await request(app).post('/auth/login').send({})
    expect(res.status).toBe(400)
  })
})

describe('POST /auth/logout', () => {
  it('déconnexion valide → 204', async () => {
    prismaMock.refreshToken.updateMany.mockResolvedValue({ count: 1 })
    const res = await request(app).post('/auth/logout').send({
      refreshToken: 'valid-refresh-token',
    })
    expect(res.status).toBe(204)
  })

  it('refreshToken manquant → 400', async () => {
    const res = await request(app).post('/auth/logout').send({})
    expect(res.status).toBe(400)
  })
})
```

### Fichier `backend/src/__tests__/middlewares/auth.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { authenticate, authorize } from '../../middlewares/auth'
import { Role } from '../../../generated/prisma/client'

process.env.JWT_SECRET = 'test-secret-key-for-vitest'

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
  return res
}

function mockReq(headers: Record<string, string> = {}) {
  return { headers, user: undefined } as unknown as Request
}

function makeToken(payload: object, secret = 'test-secret-key-for-vitest') {
  return jwt.sign(payload, secret, { expiresIn: '1h' })
}

describe('authenticate', () => {
  it('token valide → hydrate req.user et appelle next()', () => {
    const token = makeToken({ sub: '1', role: Role.USER, email: 'a@b.com' })
    const req = mockReq({ authorization: `Bearer ${token}` })
    const res = mockRes()
    const next = vi.fn() as NextFunction

    authenticate(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.user).toEqual({ id: 1, role: Role.USER, email: 'a@b.com' })
  })

  it('absence d\'en-tête Authorization → 401', () => {
    const req = mockReq()
    const res = mockRes()
    const next = vi.fn() as NextFunction

    authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('token avec mauvaise signature → 401', () => {
    const token = makeToken({ sub: '1', role: Role.USER, email: 'a@b.com' }, 'wrong-secret')
    const req = mockReq({ authorization: `Bearer ${token}` })
    const res = mockRes()
    const next = vi.fn() as NextFunction

    authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('token expiré → 401', async () => {
    const token = jwt.sign(
      { sub: '1', role: Role.USER, email: 'a@b.com' },
      'test-secret-key-for-vitest',
      { expiresIn: 0 }
    )
    await new Promise(r => setTimeout(r, 10))
    const req = mockReq({ authorization: `Bearer ${token}` })
    const res = mockRes()
    const next = vi.fn() as NextFunction

    authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
  })
})

describe('authorize', () => {
  it('rôle ADMIN autorisé pour authorize(ADMIN) → appelle next()', () => {
    const req = mockReq()
    req.user = { id: 1, role: Role.ADMIN, email: 'admin@example.com' }
    const res = mockRes()
    const next = vi.fn() as NextFunction

    authorize(Role.ADMIN)(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('rôle USER refusé pour authorize(ADMIN) → 403', () => {
    const req = mockReq()
    req.user = { id: 1, role: Role.USER, email: 'user@example.com' }
    const res = mockRes()
    const next = vi.fn() as NextFunction

    authorize(Role.ADMIN)(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('req.user absent → 401', () => {
    const req = mockReq()
    const res = mockRes()
    const next = vi.fn() as NextFunction

    authorize(Role.EMPLOYEE)(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
  })
})
```

### Fichier `frontend/src/__tests__/contexts/AuthContext.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'

vi.mock('../../lib/api', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '../../lib/api'
const apiFetchMock = apiFetch as ReturnType<typeof vi.fn>

function makeJwt(payload: object) {
  // Crée un JWT factice (non signé) pour simuler localStorage
  const encoded = btoa(JSON.stringify(payload))
  return `header.${encoded}.signature`
}

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthContext', () => {
  describe('login()', () => {
    it('stocke les tokens dans localStorage et met user à jour', async () => {
      const mockData = {
        accessToken: makeJwt({ sub: '1', email: 'a@b.com', role: 'USER', exp: 9999999999 }),
        refreshToken: 'refresh-abc',
        user: { id: 1, email: 'a@b.com', role: 'USER' as const },
      }
      apiFetchMock.mockResolvedValue(mockData)

      const { result } = renderHook(() => useAuth(), { wrapper })
      await act(async () => {
        await result.current.login('a@b.com', 'password123')
      })

      expect(localStorage.getItem('accessToken')).toBe(mockData.accessToken)
      expect(localStorage.getItem('refreshToken')).toBe('refresh-abc')
      expect(result.current.user?.email).toBe('a@b.com')
    })
  })

  describe('logout()', () => {
    it('supprime les tokens du localStorage et remet user à null', async () => {
      localStorage.setItem('accessToken', 'some-token')
      localStorage.setItem('refreshToken', 'some-refresh')
      apiFetchMock.mockResolvedValue({})

      const { result } = renderHook(() => useAuth(), { wrapper })
      act(() => result.current.logout())

      expect(localStorage.getItem('accessToken')).toBeNull()
      expect(localStorage.getItem('refreshToken')).toBeNull()
      expect(result.current.user).toBeNull()
    })
  })

  describe('getUserFromToken()', () => {
    it('restaure la session si un token valide est dans localStorage', () => {
      const payload = { sub: '5', email: 'restored@b.com', role: 'ADMIN', exp: 9999999999 }
      const token = makeJwt(payload)
      localStorage.setItem('accessToken', token)

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.user?.email).toBe('restored@b.com')
      expect(result.current.user?.role).toBe('ADMIN')
    })

    it('retourne null si le token est expiré', () => {
      const payload = { sub: '5', email: 'old@b.com', role: 'USER', exp: 1 }
      const token = makeJwt(payload)
      localStorage.setItem('accessToken', token)

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.user).toBeNull()
    })
  })

  describe('isEmployee', () => {
    it('est true pour le rôle EMPLOYEE', async () => {
      const mockData = {
        accessToken: makeJwt({ sub: '2', email: 'emp@b.com', role: 'EMPLOYEE', exp: 9999999999 }),
        refreshToken: 'r',
        user: { id: 2, email: 'emp@b.com', role: 'EMPLOYEE' as const },
      }
      apiFetchMock.mockResolvedValue(mockData)

      const { result } = renderHook(() => useAuth(), { wrapper })
      await act(async () => { await result.current.login('emp@b.com', 'pass') })

      expect(result.current.isEmployee).toBe(true)
    })

    it('est false pour le rôle USER', async () => {
      const mockData = {
        accessToken: makeJwt({ sub: '3', email: 'u@b.com', role: 'USER', exp: 9999999999 }),
        refreshToken: 'r',
        user: { id: 3, email: 'u@b.com', role: 'USER' as const },
      }
      apiFetchMock.mockResolvedValue(mockData)

      const { result } = renderHook(() => useAuth(), { wrapper })
      await act(async () => { await result.current.login('u@b.com', 'pass') })

      expect(result.current.isEmployee).toBe(false)
    })
  })
})
```

---

## Phase 3 — Tests du jeu promotionnel (critique)

### Fichier `backend/src/__tests__/routes/game.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { createTestApp } from '../testApp'
import { makeAccessToken, testUser } from '../helpers'
import prisma from '../../prisma'

vi.mock('../../prisma', () => ({ /* voir pattern ci-dessus */ }))
vi.mock('../../events/winEvents', () => ({
  publishWinEvent: vi.fn(),
  subscribeToWinEvents: vi.fn().mockReturnValue(() => {}),
}))

const prismaMock = prisma as any
const app = createTestApp()
process.env.JWT_SECRET = 'test-secret-key-for-vitest'

const TODAY_START = new Date()
TODAY_START.setHours(0, 0, 0, 0)

const mockPrize = {
  id: 1,
  name: 'Bon Nike 20.-',
  description: 'Bon d\'achat 20 CHF',
  shopName: 'Nike',
  quantity: 10,
  claimed: 2,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

function authHeader(role: 'USER' | 'EMPLOYEE' | 'ADMIN' = 'USER') {
  const token = makeAccessToken({
    sub: String(testUser.id),
    role,
    email: testUser.email,
  })
  return { Authorization: `Bearer ${token}` }
}

describe('POST /game/play', () => {
  describe('Accès', () => {
    it('sans authentification → 401', async () => {
      const res = await request(app).post('/game/play')
      expect(res.status).toBe(401)
    })
  })

  describe('Scénarios nominaux', () => {
    beforeEach(() => {
      prismaMock.gamePlay.count.mockResolvedValue(0) // 0 prix distribués aujourd'hui
      prismaMock.prize.findMany.mockResolvedValue([mockPrize])
      prismaMock.prize.update.mockResolvedValue({ ...mockPrize, claimed: 3 })
    })

    it('1ère tentative perdue → canPlayAgain true, attempt 1', async () => {
      prismaMock.gamePlay.findMany.mockResolvedValue([]) // aucune partie aujourd'hui
      // Forcer une perte en mockant Math.random
      vi.spyOn(Math, 'random').mockReturnValue(0.99) // > WIN_PROBABILITY
      prismaMock.gamePlay.create.mockResolvedValue({
        id: 1, userId: 1, won: false, attempt: 1, prize: null, voucherCode: null, playedAt: new Date(),
      })

      const res = await request(app)
        .post('/game/play')
        .set(authHeader())

      expect(res.status).toBe(200)
      expect(res.body.won).toBe(false)
      expect(res.body.canPlayAgain).toBe(true)
      expect(res.body.attempt).toBe(1)
    })

    it('2ème tentative après perte → attempt 2, canPlayAgain false', async () => {
      prismaMock.gamePlay.findMany.mockResolvedValue([
        { id: 1, won: false, attempt: 1, playedAt: new Date() }
      ])
      vi.spyOn(Math, 'random').mockReturnValue(0.99)
      prismaMock.gamePlay.create.mockResolvedValue({
        id: 2, userId: 1, won: false, attempt: 2, prize: null, voucherCode: null, playedAt: new Date(),
      })

      const res = await request(app)
        .post('/game/play')
        .set(authHeader())

      expect(res.status).toBe(200)
      expect(res.body.attempt).toBe(2)
      expect(res.body.canPlayAgain).toBe(false)
    })

    it('tentative gagnante → won true, prize non null, voucherCode format FOX-XXXX', async () => {
      prismaMock.gamePlay.findMany.mockResolvedValue([])
      vi.spyOn(Math, 'random').mockReturnValue(0.1) // < WIN_PROBABILITY
      prismaMock.gamePlay.create.mockResolvedValue({
        id: 3, userId: 1, won: true, attempt: 1,
        prize: 'Bon Nike 20.-',
        voucherCode: 'FOX-A1B2C3D4',
        playedAt: new Date(),
      })

      const res = await request(app)
        .post('/game/play')
        .set(authHeader())

      expect(res.status).toBe(200)
      expect(res.body.won).toBe(true)
      expect(res.body.prize).toBe('Bon Nike 20.-')
      expect(res.body.voucherCode).toMatch(/^FOX-[A-F0-9]{8}$/)
    })
  })

  describe('Cas d\'erreur métier', () => {
    it('2 tentatives déjà utilisées → 400', async () => {
      prismaMock.gamePlay.findMany.mockResolvedValue([
        { id: 1, won: false, attempt: 1, playedAt: new Date() },
        { id: 2, won: false, attempt: 2, playedAt: new Date() },
      ])

      const res = await request(app)
        .post('/game/play')
        .set(authHeader())

      expect(res.status).toBe(400)
      expect(res.body.error).toContain('deux tentatives')
    })

    it('1ère tentative gagnée → 2ème tentative → 400', async () => {
      prismaMock.gamePlay.findMany.mockResolvedValue([
        { id: 1, won: true, attempt: 1, playedAt: new Date() }
      ])

      const res = await request(app)
        .post('/game/play')
        .set(authHeader())

      expect(res.status).toBe(400)
      expect(res.body.error).toContain('gagné')
    })
  })

  describe('Cas limites', () => {
    it('10 prix déjà distribués → won forcé à false', async () => {
      prismaMock.gamePlay.findMany.mockResolvedValue([])
      prismaMock.gamePlay.count.mockResolvedValue(10) // MAX atteint
      vi.spyOn(Math, 'random').mockReturnValue(0.1)
      prismaMock.gamePlay.create.mockResolvedValue({
        id: 4, userId: 1, won: false, attempt: 1, prize: null, voucherCode: null, playedAt: new Date(),
      })

      const res = await request(app)
        .post('/game/play')
        .set(authHeader())

      expect(res.status).toBe(200)
      expect(res.body.won).toBe(false)
    })

    it('tous les lots sont épuisés (claimed >= quantity) → didWin false', async () => {
      prismaMock.gamePlay.findMany.mockResolvedValue([])
      prismaMock.gamePlay.count.mockResolvedValue(0)
      prismaMock.prize.findMany.mockResolvedValue([
        { ...mockPrize, quantity: 5, claimed: 5 } // épuisé
      ])
      vi.spyOn(Math, 'random').mockReturnValue(0.1)
      prismaMock.gamePlay.create.mockResolvedValue({
        id: 5, userId: 1, won: false, attempt: 1, prize: null, voucherCode: null, playedAt: new Date(),
      })

      const res = await request(app)
        .post('/game/play')
        .set(authHeader())

      expect(res.status).toBe(200)
      expect(res.body.won).toBe(false)
    })
  })
})

describe('GET /game/status', () => {
  it('sans authentification → 401', async () => {
    const res = await request(app).get('/game/status')
    expect(res.status).toBe(401)
  })

  it('aucune partie aujourd\'hui → canPlay true, attempt 1, hasPlayed false', async () => {
    prismaMock.gamePlay.findMany.mockResolvedValue([])
    prismaMock.gamePlay.count.mockResolvedValue(0)

    const res = await request(app)
      .get('/game/status')
      .set(authHeader())

    expect(res.status).toBe(200)
    expect(res.body.canPlay).toBe(true)
    expect(res.body.attempt).toBe(1)
    expect(res.body.hasPlayed).toBe(false)
  })

  it('1 partie perdue → canPlay true, attempt 2', async () => {
    prismaMock.gamePlay.findMany.mockResolvedValue([
      { id: 1, won: false, attempt: 1, prize: null, voucherCode: null, playedAt: new Date() }
    ])
    prismaMock.gamePlay.count.mockResolvedValue(0)

    const res = await request(app)
      .get('/game/status')
      .set(authHeader())

    expect(res.body.canPlay).toBe(true)
    expect(res.body.attempt).toBe(2)
  })

  it('1 partie gagnée → canPlay false', async () => {
    prismaMock.gamePlay.findMany.mockResolvedValue([
      { id: 1, won: true, attempt: 1, prize: 'Bon Nike', voucherCode: 'FOX-1234', playedAt: new Date() }
    ])
    prismaMock.gamePlay.count.mockResolvedValue(1)

    const res = await request(app)
      .get('/game/status')
      .set(authHeader())

    expect(res.body.canPlay).toBe(false)
  })

  it('prizesRemainingToday n\'est jamais négatif', async () => {
    prismaMock.gamePlay.findMany.mockResolvedValue([])
    prismaMock.gamePlay.count.mockResolvedValue(15) // > MAX_PRIZES_PER_DAY

    const res = await request(app)
      .get('/game/status')
      .set(authHeader())

    expect(res.body.prizesRemainingToday).toBe(0)
  })
})
```

---

## Phase 4 — Tests fonctionnalités supplémentaires

### Fichier `backend/src/__tests__/routes/visitors.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { createTestApp } from '../testApp'
import { makeAccessToken } from '../helpers'
import prisma from '../../prisma'

vi.mock('../../prisma', () => ({ /* voir pattern ci-dessus */ }))

const prismaMock = prisma as any
const app = createTestApp()
process.env.JWT_SECRET = 'test-secret-key-for-vitest'

function employeeHeader() {
  return { Authorization: `Bearer ${makeAccessToken({ sub: '2', role: 'EMPLOYEE', email: 'emp@b.com' })}` }
}

function userHeader() {
  return { Authorization: `Bearer ${makeAccessToken({ sub: '1', role: 'USER', email: 'u@b.com' })}` }
}

describe('POST /visitors/track', () => {
  it('enregistre une visite avec le chemin fourni', async () => {
    prismaMock.visitorLog.create.mockResolvedValue({ id: 1, path: '/boutiques', visitedAt: new Date() })
    const res = await request(app).post('/visitors/track').send({ path: '/boutiques' })
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(prismaMock.visitorLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { path: '/boutiques' } })
    )
  })

  it('utilise "/" si aucun chemin fourni', async () => {
    prismaMock.visitorLog.create.mockResolvedValue({ id: 2, path: '/', visitedAt: new Date() })
    await request(app).post('/visitors/track').send({})
    expect(prismaMock.visitorLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { path: '/' } })
    )
  })
})

describe('GET /visitors/stats', () => {
  beforeEach(() => {
    prismaMock.visitorLog.count.mockResolvedValue(42)
    prismaMock.$queryRaw.mockResolvedValue([])
  })

  it('avec EMPLOYEE → 200 avec today, thisMonth, thisYear, total', async () => {
    const res = await request(app)
      .get('/visitors/stats')
      .set(employeeHeader())
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('today')
    expect(res.body).toHaveProperty('thisMonth')
    expect(res.body).toHaveProperty('thisYear')
    expect(res.body).toHaveProperty('total')
    expect(res.body).toHaveProperty('dailyBreakdown')
  })

  it('avec USER → 403', async () => {
    const res = await request(app)
      .get('/visitors/stats')
      .set(userHeader())
    expect(res.status).toBe(403)
  })

  it('sans authentification → 401', async () => {
    const res = await request(app).get('/visitors/stats')
    expect(res.status).toBe(401)
  })
})
```

### Fichier `backend/src/__tests__/routes/parking.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import { createTestApp } from '../testApp'
import { makeAccessToken } from '../helpers'
import prisma from '../../prisma'

vi.mock('../../prisma', () => ({ /* voir pattern ci-dessus */ }))

const prismaMock = prisma as any
const app = createTestApp()
process.env.JWT_SECRET = 'test-secret-key-for-vitest'

const mockParkings = [
  { id: 1, name: 'Parking A', totalSpaces: 100, availableSpaces: 42, updatedAt: new Date() },
  { id: 2, name: 'Parking B', totalSpaces: 50, availableSpaces: 10, updatedAt: new Date() },
]

function employeeHeader() {
  return { Authorization: `Bearer ${makeAccessToken({ sub: '2', role: 'EMPLOYEE', email: 'emp@b.com' })}` }
}
function userHeader() {
  return { Authorization: `Bearer ${makeAccessToken({ sub: '1', role: 'USER', email: 'u@b.com' })}` }
}

describe('GET /parking', () => {
  it('retourne la liste des parkings triée par nom (200, sans auth)', async () => {
    prismaMock.parking.findMany.mockResolvedValue(mockParkings)
    const res = await request(app).get('/parking')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body[0].name).toBe('Parking A')
  })
})

describe('PUT /parking/:id', () => {
  it('avec EMPLOYEE → met à jour les places disponibles (200)', async () => {
    prismaMock.parking.update.mockResolvedValue({ ...mockParkings[0], availableSpaces: 30 })
    const res = await request(app)
      .put('/parking/1')
      .set(employeeHeader())
      .send({ availableSpaces: 30 })
    expect(res.status).toBe(200)
    expect(res.body.availableSpaces).toBe(30)
  })

  it('availableSpaces négatif → 400', async () => {
    const res = await request(app)
      .put('/parking/1')
      .set(employeeHeader())
      .send({ availableSpaces: -5 })
    expect(res.status).toBe(400)
  })

  it('id inexistant → 404', async () => {
    prismaMock.parking.update.mockRejectedValue(new Error('Not found'))
    const res = await request(app)
      .put('/parking/999')
      .set(employeeHeader())
      .send({ availableSpaces: 10 })
    expect(res.status).toBe(404)
  })

  it('avec USER → 403', async () => {
    const res = await request(app)
      .put('/parking/1')
      .set(userHeader())
      .send({ availableSpaces: 10 })
    expect(res.status).toBe(403)
  })

  it('sans authentification → 401', async () => {
    const res = await request(app).put('/parking/1').send({ availableSpaces: 10 })
    expect(res.status).toBe(401)
  })
})
```

---

## Phase 5 — Tests E2E Playwright

> Prérequis : l'application tourne en local sur `http://localhost:5173` (frontend) et `http://localhost:3000` (backend).

### Fichier `e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentification et jeu', () => {
  test('créer un compte puis accéder au jeu', async ({ page }) => {
    const email = `test_${Date.now()}@example.com`

    // Inscription
    await page.goto('/register')
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/mot de passe|password/i).fill('password123')
    await page.getByRole('button', { name: /s'inscrire|register/i }).click()

    // Vérifie que l'utilisateur est connecté
    await expect(page.getByText(email)).toBeVisible({ timeout: 5000 })

    // Navigue vers le jeu
    await page.goto('/')
    await expect(page.getByText(/gratter|jouer|essayer/i)).toBeVisible()
  })
})
```

### Fichier `e2e/game.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Règles du jeu promotionnel', () => {
  test.beforeEach(async ({ page }) => {
    // Connexion avec un compte de test existant
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('testplayer@example.com')
    await page.getByLabel(/mot de passe/i).fill('password123')
    await page.getByRole('button', { name: /connexion|se connecter/i }).click()
    await page.waitForURL('/')
  })

  test('tentative de rejouer dans la même journée est bloquée', async ({ page }) => {
    await page.goto('/')
    // Si le joueur a déjà joué aujourd'hui, le bouton doit être désactivé ou absent
    const playButton = page.getByRole('button', { name: /gratter|jouer/i })
    // Le comportement dépend de l'état du jour — vérifier que le message "revenez demain" est affiché
    // ou que le bouton n'est pas actif
    await expect(
      page.getByText(/revenez demain|already played|revenir/i)
        .or(playButton)
    ).toBeVisible()
  })
})
```

### Fichier `e2e/shops.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Liste des boutiques', () => {
  test('affiche les boutiques et le lien vers le site officiel', async ({ page }) => {
    await page.goto('/boutiques')

    // La page doit contenir au moins une boutique
    const shopCards = page.locator('[data-testid="shop-card"], .shop-card, article')
    await expect(shopCards.first()).toBeVisible({ timeout: 5000 })

    // Vérifie qu'un lien externe est présent pour au moins une boutique
    const externalLink = page.getByRole('link', { name: /site officiel|visiter|website/i }).first()
    await expect(externalLink).toBeVisible()

    const href = await externalLink.getAttribute('href')
    expect(href).toMatch(/^https?:\/\//)
  })
})
```

### Fichier `e2e/parking.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Consultation des parkings', () => {
  test('affiche le nombre de places disponibles', async ({ page }) => {
    await page.goto('/parkings')

    // Attend que la page soit chargée
    await expect(page.getByText(/parking/i).first()).toBeVisible({ timeout: 5000 })

    // Vérifie qu'un nombre de places est affiché
    await expect(
      page.getByText(/places? disponibles?|\d+ places?/i).first()
    ).toBeVisible()
  })

  test('les données de parking sont cohérentes (disponible ≤ total)', async ({ page }) => {
    await page.goto('/parkings')
    await page.waitForLoadState('networkidle')

    // Vérification visuelle que les nombres s'affichent correctement
    const parkingInfo = page.getByText(/\d+\s*\/\s*\d+|\d+\s*places/i).first()
    await expect(parkingInfo).toBeVisible()
  })
})
```

---

## Phase 6 — Documentation

### Contenu attendu de `backend/src/__tests__/README.md`

````markdown
# Tests backend — WebMall

## Prérequis
- Node.js >= 20
- Dépendances installées : `npm install`

## Configuration
Créer `backend/.env.test` avec :
```env
JWT_SECRET=test-secret-key-for-vitest
DATABASE_URL=postgresql://...  # ou laisser vide (prisma mocké)
```

## Lancer les tests
```bash
cd backend
npm run test           # exécution unique
npm run test:watch     # mode watch (développement)
npm run test:coverage  # avec rapport de couverture
```

## Localisation des fichiers
```
backend/src/__tests__/
├── routes/          # Tests des routes API (game, auth, shop, parking, visitors)
├── middlewares/     # Tests du middleware authenticate et authorize
├── setup.ts         # Configuration globale (clearAllMocks)
├── helpers.ts       # makeAccessToken, données de test
└── testApp.ts       # Express minimal pour supertest
```

## Lecture des résultats
- Vert ✓ = test passé
- Rouge ✗ = test échoué (voir message d'erreur)
- Couverture : ouvrir `coverage/index.html` pour le détail par fichier
````

### Contenu attendu de `e2e/README.md`

````markdown
# Tests E2E — WebMall (Playwright)

## Prérequis
- Node.js >= 20
- Application en cours d'exécution (frontend + backend + base de données)
- Chromium installé : `npx playwright install chromium`

## Configuration
Créer `e2e/.env` si nécessaire :
```env
BASE_URL=http://localhost:5173
```

## Lancer les tests
```bash
# À la racine du projet
npx playwright test              # tous les specs
npx playwright test e2e/auth.spec.ts   # un seul spec
npx playwright test --headed     # avec navigateur visible
npx playwright show-report       # rapport HTML après exécution
```

## Localisation des fichiers
```
e2e/
├── auth.spec.ts      # Inscription et accès au jeu
├── game.spec.ts      # Règles quotidiennes du jeu
├── shops.spec.ts     # Navigation et liens boutiques
└── parking.spec.ts   # Consultation des parkings
```

## Test E2E manuel documenté

**Scénario : Connexion → Jeu → Déconnexion**

1. Ouvrir http://localhost:5173
2. Cliquer sur "Se connecter"
3. Saisir un email et mot de passe valides
4. Vérifier que le nom d'utilisateur apparaît dans la navigation
5. Naviguer vers la page d'accueil
6. Cliquer sur le jeu de grattage
7. Vérifier le résultat (gagné ou perdu)
8. Cliquer sur "Se déconnecter"
9. Vérifier que l'utilisateur est redirigé et déconnecté

**Résultat attendu :** Chaque étape se déroule sans erreur visible.
````

---

## Conventions de code

1. **Nommage des fichiers de test** : `<module>.test.ts` (backend), `<Component>.test.tsx` (frontend), `<feature>.spec.ts` (E2E)
2. **Structure des blocs** : `describe(sujet) > describe(méthode/scenario) > it(comportement attendu)`
3. **Libellé des tests** : en français, en phrase complète, décrivant le comportement — ex: `"1ère tentative perdue → canPlayAgain true"`
4. **Mocks** : toujours placer `vi.mock(...)` en dehors des blocs `describe/it`, au niveau module
5. **Réinitialisation** : `vi.clearAllMocks()` dans `afterEach` (géré par `setup.ts`)
6. **Pas de base de données réelle** dans les tests unitaires — Prisma est toujours mocké
7. **Variables d'environnement** : définir `process.env.JWT_SECRET` dans chaque fichier de test backend

## Vérification que l'implémentation est correcte

```bash
# 1. Tests unitaires + intégration backend
cd backend && npm run test
# Attendu : tous les tests passent, >= 30 tests

# 2. Tests unitaires + intégration frontend
cd ../frontend && npm run test
# Attendu : tous les tests passent, >= 20 tests

# 3. Couverture de code
cd ../backend && npm run test:coverage
# Attendu : couverture >= 80% sur routes/game.ts, middlewares/auth.ts, routes/auth.ts

# 4. Tests E2E (application démarrée)
cd .. && npx playwright test
# Attendu : 4 specs passent

# Compte total minimum :
# - Backend : ~35 tests unitaires (auth + game + shop + parking + visitors + middleware)
# - Frontend : ~15 tests (AuthContext + pages + composants)
# - E2E : 4 specs automatisés
# TOTAL : >= 50 tests unitaires + >= 5 intégration + >= 1 E2E automatisé
```
