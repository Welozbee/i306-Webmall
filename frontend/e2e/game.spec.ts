/**
 * Tests E2E – Module Jeu Promotionnel (frontend)
 *
 * Outil  : Playwright
 * Périmètre : parcours utilisateur complets via l'interface graphique
 *
 * Stratégie : les appels API sont interceptés via page.route() pour rendre
 * les tests reproductibles sans avoir besoin d'un backend opérationnel.
 *
 * Note : pour exécuter ces tests, la commande est :
 *   cd frontend && npx playwright test e2e/game.spec.ts
 */

import { test, expect, type Page } from "@playwright/test";

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Construit un JWT minimal décodable par le frontend (AuthContext lit le payload
 * via atob sans vérifier la signature).
 */
function makeFakeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ).toString("base64url");
  return `${header}.${body}.fakesignature`;
}

const fakeAccessToken = makeFakeJwt({
  sub: "1",
  email: "player@webmall.ch",
  role: "USER",
});

const fakeRegisterResponse = {
  accessToken: fakeAccessToken,
  refreshToken: "fake-refresh-token-abcdef",
  user: { id: 1, email: "player@webmall.ch", role: "USER" },
};

// Statut : première tentative disponible
const fakeStatusCanPlay = {
  canPlay: true,
  attempt: 1,
  hasPlayed: false,
  todaysPlays: [],
  prizesRemainingToday: 8,
};

// Statut : quota épuisé (2 tentatives utilisées)
const fakeStatusDone = {
  canPlay: false,
  attempt: 2,
  hasPlayed: true,
  todaysPlays: [
    { won: false, prize: null, attempt: 1 },
    { won: false, prize: null, attempt: 2 },
  ],
  prizesRemainingToday: 8,
};

// Résultat de jeu : victoire
const fakeWinResult = {
  won: true,
  attempt: 1,
  prize: "Bon Migros 50 CHF",
  voucherCode: "FOX-ABCD1234",
  canPlayAgain: false,
  message: "Félicitations ! Vous avez gagné un bon d'achat !",
};

// Historique des gains
const fakeRewards = [
  {
    id: 1,
    prize: "Bon Migros 50 CHF",
    voucherCode: "FOX-ABCD1234",
    playedAt: "2026-03-15T10:00:00.000Z",
  },
];

/** Intercepte les routes publiques nécessaires au chargement de la page d'accueil */
async function mockPublicRoutes(page: Page) {
  await page.route("**/api/visitors/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ count: 1234 }),
    }),
  );
  await page.route("**/api/parking**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ id: 1, name: "P1", totalSpaces: 500, availableSpaces: 142 }]),
    }),
  );
}

/**
 * Effectue le flux d'inscription via le formulaire et attendant la redirection
 * vers la page d'accueil.
 */
async function registerViaForm(page: Page) {
  await page.goto("/register");
  await page.getByPlaceholder(/votre@email/i).fill("player@webmall.ch");
  await page.getByPlaceholder(/minimum 8/i).fill("Password123!");
  await page.getByPlaceholder(/retapez/i).fill("Password123!");
  await page.getByRole("button", { name: /créer mon compte/i }).click();
  await expect(page).toHaveURL("/");
}

/**
 * Simule le grattage de la ScratchCard avec 5 passes horizontales couvrant
 * plus de 50 % de la surface (seuil déclenchant onComplete).
 */
async function scratchCanvas(page: Page) {
  const canvas = page.locator("canvas").first();
  await canvas.waitFor({ state: "visible" });
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Bounding box du canvas introuvable");

  // Initialiser la position de la souris sur le canvas
  await page.mouse.move(box.x + 10, box.y + box.height / 2);
  await page.mouse.down();

  // 5 passes horizontales espacées uniformément sur la hauteur
  for (let row = 0; row < 5; row++) {
    const y = box.y + (box.height / 5) * row + box.height / 10;
    await page.mouse.move(box.x + 10, y);
    await page.mouse.move(box.x + box.width - 10, y, { steps: 20 });
  }

  await page.mouse.up();
}

// ─── E2E-GAME-FE-01 : Connexion → gratter la carte → résultat affiché ─────────

test("E2E-GAME-FE-01 : connexion → gratter la carte → résultat affiché", async ({ page }) => {
  // Arrange : intercepter toutes les API nécessaires
  await mockPublicRoutes(page);

  await page.route("**/api/auth/register", (route) =>
    route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(fakeRegisterResponse),
    }),
  );
  await page.route("**/api/auth/logout", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "ok" }),
    }),
  );

  // Le statut change après que le joueur a joué
  let hasPlayed = false;
  await page.route("**/api/game/status", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(hasPlayed ? fakeStatusDone : fakeStatusCanPlay),
    }),
  );

  await page.route("**/api/game/play", (route) => {
    hasPlayed = true;
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fakeWinResult),
    });
  });

  // Arrange : s'inscrire et atterrir sur la page d'accueil
  await registerViaForm(page);

  // Assert : le bouton de jeu est visible (canPlay: true)
  await expect(
    page.getByRole("button", { name: /gratter ma carte/i }),
  ).toBeVisible();

  // Act : cliquer sur le bouton de jeu pour déclencher POST /game/play
  await page.getByRole("button", { name: /gratter ma carte/i }).click();

  // Assert : le canvas de la ScratchCard est affiché
  await expect(page.locator("canvas").first()).toBeVisible();

  // Act : gratter la carte en simulant des événements souris
  await scratchCanvas(page);

  // Assert : le résultat de victoire est affiché (message + code bon d'achat)
  await expect(page.getByText("FOX-ABCD1234").first()).toBeVisible();
});

// ─── E2E-GAME-FE-02 : Connexion → /rewards → historique affiché ──────────────

test("E2E-GAME-FE-02 : connexion → naviguer vers /rewards → historique affiché", async ({ page }) => {
  // Arrange : intercepter les APIs et retourner un historique de gains
  await mockPublicRoutes(page);

  await page.route("**/api/auth/register", (route) =>
    route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(fakeRegisterResponse),
    }),
  );
  await page.route("**/api/auth/logout", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "ok" }),
    }),
  );
  await page.route("**/api/game/status", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fakeStatusCanPlay),
    }),
  );
  await page.route("**/api/game/rewards", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fakeRewards),
    }),
  );

  // Arrange : s'inscrire et atterrir sur la page d'accueil
  await registerViaForm(page);

  // Act : naviguer directement vers la page des récompenses
  await page.goto("/rewards");

  // Assert : la page des récompenses est chargée
  await expect(
    page.getByRole("heading", { name: /mes récompenses/i }),
  ).toBeVisible();

  // Assert : le gain est affiché avec son code et le nom du lot
  await expect(page.getByText("FOX-ABCD1234")).toBeVisible();
  await expect(page.getByText(/bon migros 50 chf/i)).toBeVisible();
});

// ─── E2E-GAME-FE-03 : Quota épuisé → message «déjà joué» affiché ─────────────

test("E2E-GAME-FE-03 : connexion → quota épuisé → message «déjà joué» affiché", async ({ page }) => {
  // Arrange : le statut de jeu indique que les deux tentatives sont épuisées
  await mockPublicRoutes(page);

  await page.route("**/api/auth/register", (route) =>
    route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(fakeRegisterResponse),
    }),
  );
  await page.route("**/api/auth/logout", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "ok" }),
    }),
  );
  await page.route("**/api/game/status", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fakeStatusDone),
    }),
  );

  // Arrange : s'inscrire — le statut de jeu retourné indique quota épuisé
  await registerViaForm(page);

  // Assert : le message "déjà joué" est affiché
  await expect(
    page.getByText(/vous avez déjà joué aujourd'hui/i),
  ).toBeVisible();

  // Assert : le bouton "Gratter ma carte !" est absent
  await expect(
    page.getByRole("button", { name: /gratter ma carte/i }),
  ).not.toBeVisible();
});
