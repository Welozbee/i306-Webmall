/**
 * Tests E2E – Module Authentification (frontend)
 *
 * Outil  : Playwright
 * Périmètre : parcours utilisateur complets via l'interface graphique
 *
 * Stratégie : les appels API sont interceptés via page.route() pour rendre
 * les tests reproductibles sans avoir besoin d'un backend opérationnel.
 * Le comportement testé est celui du frontend (formulaires, redirections,
 * affichage conditionnel) en réponse à des réponses API simulées réalistes.
 *
 * Note : pour exécuter ces tests, la commande est :
 *   cd frontend && npx playwright test e2e/auth.spec.ts
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

const TEST_EMAIL = "test@webmall.ch";

const fakeAccessToken = makeFakeJwt({
  sub: "1",
  email: TEST_EMAIL,
  role: "USER",
});

const fakeRegisterResponse = {
  accessToken: fakeAccessToken,
  refreshToken: "fake-refresh-token-abcdef",
  user: { id: 1, email: TEST_EMAIL, role: "USER" },
};

const fakeGameStatus = {
  canPlay: true,
  attempt: 1,
  hasPlayed: false,
  todaysPlays: [],
  prizesRemainingToday: 8,
};

/**
 * Intercepte les appels API nécessaires à l'inscription et au jeu.
 */
async function mockAuthAndGameRoutes(page: Page) {
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
      body: JSON.stringify({ message: "Logged out successfully" }),
    }),
  );

  await page.route("**/api/game/status", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fakeGameStatus),
    }),
  );

  // Routes publiques nécessaires au chargement de la page d'accueil
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

// ─── E2E-AUTH-01 : Inscription via UI ─────────────────────────────────────────

test("E2E-AUTH-01 : inscription via UI → redirection → accès au jeu", async ({
  page,
}) => {
  // Arrange : intercepter les appels API et naviguer vers /register
  await mockAuthAndGameRoutes(page);
  await page.goto("/register");

  // Assert – page d'inscription affichée
  await expect(
    page.getByRole("heading", { name: /créer un compte/i }),
  ).toBeVisible();

  // Act – remplir le formulaire d'inscription
  await page.getByLabel(/^email/i).fill("test@webmall.ch");
  await page.getByLabel(/^mot de passe$/i).fill("Password123!");
  await page.getByLabel(/confirmer/i).fill("Password123!");

  // Act – soumettre
  await page.getByRole("button", { name: /créer mon compte/i }).click();

  // Assert – redirection vers la page d'accueil après inscription réussie
  await expect(page).toHaveURL("/");

  // Assert – section jeu accessible (l'utilisateur est connecté)
  await expect(
    page.getByRole("heading", { name: /jeu du jour/i }),
  ).toBeVisible();

  // Assert – le bouton pour jouer est affiché (canPlay: true dans le mock)
  await expect(
    page.getByRole("button", { name: /gratter ma carte/i }),
  ).toBeVisible();
});

// ─── E2E-AUTH-02 : Accès au jeu sans être connecté ────────────────────────────

test(
  "E2E-AUTH-02 : accès au jeu sans être connecté → invitation à se connecter",
  async ({ page }) => {
    // Arrange : pas de token en localStorage (session vide), routes publiques mockées
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
        body: JSON.stringify([]),
      }),
    );

    // Act : naviguer vers la page d'accueil sans être connecté
    await page.goto("/");

    // Assert – section jeu visible
    await expect(
      page.getByRole("heading", { name: /jeu du jour/i }),
    ).toBeVisible();

    // Assert – invitation à se connecter affichée à la place du jeu
    await expect(
      page.getByText(/connectez-vous pour participer/i),
    ).toBeVisible();

    // Assert – lien "Se connecter" présent dans la section jeu
    const loginLink = page.getByRole("link", { name: /se connecter/i }).first();
    await expect(loginLink).toBeVisible();

    // Act – cliquer sur le lien de connexion
    await loginLink.click();

    // Assert – redirection vers /login
    await expect(page).toHaveURL("/login");
  },
);

// ─── E2E-AUTH-FE-02 : Accès à /admin sans session → redirection /login ────────

test(
  "E2E-AUTH-FE-02 : accès à /admin sans être connecté → redirection vers /login",
  async ({ page }) => {
    // Arrange : routes publiques mockées, aucun token en localStorage (session vide)
    await page.route("**/api/visitors/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: 1234 }),
      }),
    );

    // Act : naviguer directement vers la page d'administration sans être connecté
    await page.goto("/admin");

    // Assert – AdminPage détecte l'absence de session et redirige vers /login
    await expect(page).toHaveURL("/login");
  },
);

// ─── E2E-AUTH-FE-03 : Connexion → déconnexion → jeu inaccessible ─────────────

test(
  "E2E-AUTH-FE-03 : connexion → déconnexion → jeu plus accessible",
  async ({ page }) => {
    // Arrange : intercepter toutes les APIs nécessaires au cycle connexion/déconnexion
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
        body: JSON.stringify({ message: "Logged out successfully" }),
      }),
    );
    await page.route("**/api/game/status", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(fakeGameStatus),
      }),
    );
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
        body: JSON.stringify([]),
      }),
    );

    // Arrange : s'inscrire pour obtenir une session active
    await page.goto("/register");
    await page.getByLabel(/^email/i).fill(TEST_EMAIL);
    await page.getByLabel(/^mot de passe$/i).fill("Password123!");
    await page.getByLabel(/confirmer/i).fill("Password123!");
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    await expect(page).toHaveURL("/");

    // Assert – l'utilisateur est connecté, le bouton de jeu est visible
    await expect(
      page.getByRole("button", { name: /gratter ma carte/i }),
    ).toBeVisible();

    // Act – ouvrir le menu utilisateur dans la navbar et se déconnecter
    await page.locator("header").getByText(TEST_EMAIL).click();
    await page.getByRole("button", { name: /déconnexion/i }).click();

    // Assert – après déconnexion, le jeu affiche l'invitation à se connecter
    await expect(
      page.getByText(/connectez-vous pour participer/i),
    ).toBeVisible();
  },
);
