/**
 * Tests d'intégration – Module Authentification (backend)
 *
 * Outil  : Vitest + base de données de test (PostgreSQL)
 * Isolation :
 *   – bcryptjs, jsonwebtoken et express → RÉELS (pas de mock)
 *   – Prisma → RÉEL ; la base de test doit être accessible via DATABASE_URL
 *     Les tests I-AUTH-01 et I-AUTH-02 sont automatiquement skippés si la DB
 *     n'est pas disponible. Les tests I-AUTH-03/04/05 n'accèdent pas à la DB
 *     (le middleware rejette la requête en amont) et passent dans tous les cas.
 */

import { describe, it, expect, beforeAll, afterEach, afterAll, type TaskContext } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import net from "node:net";

// ─── Pas de vi.mock – on teste les vraies dépendances ─────────────────────────
import app from "../app";
import prisma from "../prisma";

// ─── Configuration ─────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET ?? "integration-test-secret";
process.env.JWT_SECRET = JWT_SECRET;

// Préfixe commun pour identifier et nettoyer les données de test
const TEST_EMAIL_PREFIX = "i-auth-integ";

// ─── Disponibilité de la DB ────────────────────────────────────────────────────

/**
 * Vérifie si le port PostgreSQL est joignable en moins de 1,5 s.
 * Évite un blocage de 10 s si la base est éteinte.
 */
function checkDbPort(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname || "localhost";
      const port = parseInt(parsed.port || "5432", 10);
      const socket = new net.Socket();
      socket.setTimeout(1500);
      const done = (ok: boolean) => { socket.destroy(); resolve(ok); };
      socket.once("connect", () => done(true));
      socket.once("timeout", () => done(false));
      socket.once("error", () => done(false));
      socket.connect(port, host);
    } catch {
      resolve(false);
    }
  });
}

let dbAvailable = false;

beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn(
      "\n⚠  DATABASE_URL non défini – I-AUTH-01 et I-AUTH-02 seront skippés.\n",
    );
    return;
  }

  // Arrange : vérification rapide du port PostgreSQL (max 1,5 s)
  const reachable = await checkDbPort(dbUrl);
  if (!reachable) {
    console.warn(
      "\n⚠  DB non joignable – I-AUTH-01 et I-AUTH-02 seront skippés.\n" +
        "   Assurez-vous que DATABASE_URL pointe vers une base PostgreSQL de test.\n",
    );
    return;
  }

  dbAvailable = true;
});

afterEach(async () => {
  if (!dbAvailable) return;
  // Nettoyage : suppression en cascade des tokens et utilisateurs de test
  await prisma.user.deleteMany({
    where: { email: { startsWith: TEST_EMAIL_PREFIX } },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

function validUserToken(overrides: Record<string, unknown> = {}) {
  return jwt.sign(
    { sub: "999", email: "testmiddleware@webmall.ch", role: "USER", ...overrides },
    JWT_SECRET,
    { expiresIn: "1h" },
  );
}

function expiredToken() {
  return jwt.sign(
    {
      sub: "999",
      email: "testmiddleware@webmall.ch",
      role: "USER",
      // exp dans le passé (-60 s) → token périmé
      exp: Math.floor(Date.now() / 1000) - 60,
    },
    JWT_SECRET,
  );
}

// ─── I-AUTH-01 : Inscription → Connexion ─────────────────────────────────────

describe("I-AUTH-01 : Inscription → Connexion", () => {
  it(
    "crée un compte puis se connecte avec les mêmes identifiants → tokens valides",
    async (ctx: TaskContext) => {
      // Arrange : vérification DB disponible, sinon skip
      if (!dbAvailable) return ctx.skip();

      const credentials = {
        email: `${TEST_EMAIL_PREFIX}-01@webmall.ch`,
        password: "Password123!",
      };

      // Act – Étape 1 : inscription
      const registerRes = await request(app)
        .post("/auth/register")
        .send(credentials);

      // Assert – compte créé
      expect(registerRes.status).toBe(201);
      expect(registerRes.body.user.email).toBe(credentials.email);

      // Act – Étape 2 : connexion avec les mêmes identifiants
      const loginRes = await request(app)
        .post("/auth/login")
        .send(credentials);

      // Assert – tokens retournés et non vides
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.accessToken).toBeTruthy();
      expect(loginRes.body.refreshToken).toBeTruthy();
    },
  );
});

// ─── I-AUTH-02 : Connexion → Refresh → Logout ─────────────────────────────────

describe("I-AUTH-02 : Connexion → Refresh → Logout", () => {
  it(
    "flux complet de session : connexion, rotation de token, déconnexion",
    async (ctx: TaskContext) => {
      // Arrange : vérification DB disponible, sinon skip
      if (!dbAvailable) return ctx.skip();

      const credentials = {
        email: `${TEST_EMAIL_PREFIX}-02@webmall.ch`,
        password: "Password123!",
      };

      // Arrange : créer un compte via l'API
      await request(app).post("/auth/register").send(credentials);

      // Act – Étape 1 : connexion
      const loginRes = await request(app)
        .post("/auth/login")
        .send(credentials);

      // Assert – connexion réussie
      expect(loginRes.status).toBe(200);
      const { refreshToken: originalRefreshToken } = loginRes.body;
      expect(originalRefreshToken).toBeTruthy();

      // Act – Étape 2 : rotation du refresh token
      const refreshRes = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: originalRefreshToken });

      // Assert – nouvelle paire de tokens émise
      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.accessToken).toBeTruthy();
      const { refreshToken: newRefreshToken } = refreshRes.body;
      expect(newRefreshToken).toBeTruthy();
      expect(newRefreshToken).not.toBe(originalRefreshToken);

      // Act – Étape 3 : déconnexion avec le nouveau token
      const logoutRes = await request(app)
        .post("/auth/logout")
        .send({ refreshToken: newRefreshToken });

      // Assert – session terminée
      expect(logoutRes.status).toBe(200);

      // Assert – l'ancien refresh token est bien révoqué (ne peut plus être utilisé)
      const replayRes = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: originalRefreshToken });
      expect(replayRes.status).toBe(401);
    },
  );
});

// ─── I-AUTH-03 : Accès protégé sans token ─────────────────────────────────────

describe("I-AUTH-03 : Accès protégé sans token", () => {
  it("appel à POST /game/play sans header Authorization → 401", async () => {
    // Arrange : aucun header Authorization fourni

    // Act : requête vers une route protégée
    const response = await request(app).post("/game/play");

    // Assert : middleware authenticate rejette en 401 avant d'atteindre la DB
    expect(response.status).toBe(401);
  });
});

// ─── I-AUTH-04 : Accès protégé avec token expiré ──────────────────────────────

describe("I-AUTH-04 : Accès protégé avec token expiré", () => {
  it("accès avec accessToken périmé → 401", async () => {
    // Arrange : générer un token avec exp dans le passé (-60 s)
    const token = expiredToken();

    // Act : requête avec token expiré
    const response = await request(app)
      .post("/game/play")
      .set("Authorization", `Bearer ${token}`);

    // Assert : jwt.verify lève TokenExpiredError → 401 (incitation au refresh)
    expect(response.status).toBe(401);
  });
});

// ─── I-AUTH-05 : Restriction de rôle ──────────────────────────────────────────

describe("I-AUTH-05 : Restriction de rôle", () => {
  it("utilisateur avec rôle USER appelle GET /users/ → 403", async () => {
    // Arrange : token valide mais avec rôle USER (pas ADMIN)
    const userToken = validUserToken({ role: "USER" });

    // Act : appel à GET /users/ qui requiert le rôle ADMIN
    const response = await request(app)
      .get("/users/")
      .set("Authorization", `Bearer ${userToken}`);

    // Assert : authorize(ADMIN) rejette → 403 (accès insuffisant)
    expect(response.status).toBe(403);
  });
});
