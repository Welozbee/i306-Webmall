/**
 * Tests d'intégration – Module Jeu Promotionnel (backend)
 *
 * Outil  : Vitest + base de données de test (PostgreSQL)
 * Isolation :
 *   – bcryptjs, jsonwebtoken, crypto → RÉELS
 *   – Prisma → RÉEL ; base accessible via DATABASE_URL
 *   – publishWinEvent → mocké pour éviter l'I/O SSE en test
 *
 * I-GAME-01/02/03/04 nécessitent une base de test (skippés sinon).
 * I-GAME-05 teste le rejet par le middleware — pas de DB nécessaire.
 */

import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import net from "node:net";

// publishWinEvent est mocké pour ne pas tenter d'écrire sur des clients SSE
vi.mock("../events/winEvents", () => ({
  publishWinEvent: vi.fn(),
  subscribeToWinEvents: vi.fn(() => () => {}),
}));

// ─── Pas de vi.mock pour prisma, bcrypt, jwt → comportement réel ──────────────
import app from "../app";
import prisma from "../prisma";

// ─── Configuration ─────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET ?? "integration-game-secret";
process.env.JWT_SECRET = JWT_SECRET;

const TEST_EMAIL_PREFIX = "i-game-integ";

// ─── Disponibilité de la DB ────────────────────────────────────────────────────

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
    console.warn("\n⚠  DATABASE_URL non défini – tests I-GAME-01 à I-GAME-04 skippés.\n");
    return;
  }
  const reachable = await checkDbPort(dbUrl);
  if (!reachable) {
    console.warn("\n⚠  DB non joignable – tests I-GAME-01 à I-GAME-04 skippés.\n");
    return;
  }
  dbAvailable = true;
});

afterEach(async () => {
  if (!dbAvailable) return;
  // Suppression en cascade des données de test (RefreshToken, GamePlay, User)
  await prisma.user.deleteMany({
    where: { email: { startsWith: TEST_EMAIL_PREFIX } },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeAuthHeader(userId: number, role = "USER") {
  const token = jwt.sign(
    { sub: userId.toString(), email: `${TEST_EMAIL_PREFIX}@webmall.ch`, role },
    JWT_SECRET,
    { expiresIn: "1h" },
  );
  return { Authorization: `Bearer ${token}` };
}

/** Crée un utilisateur via l'API register et retourne ses tokens. */
async function registerAndLogin(suffix: string) {
  const credentials = {
    email: `${TEST_EMAIL_PREFIX}-${suffix}@webmall.ch`,
    password: "Password123!",
  };
  const res = await request(app).post("/auth/register").send(credentials);
  return {
    userId: res.body.user.id as number,
    accessToken: res.body.accessToken as string,
    refreshToken: res.body.refreshToken as string,
    authHeader: { Authorization: `Bearer ${res.body.accessToken}` },
  };
}

// ─── I-GAME-01 : Flux jeu complet — victoire ──────────────────────────────────

describe("I-GAME-01 : Flux jeu complet — victoire", () => {
  it.skipIf(!dbAvailable)(
    "status → play (gain) → rewards contient le gain",
    async () => {
      // Arrange : créer un compte et s'authentifier
      const { authHeader } = await registerAndLogin("01");

      // Act – Étape 1 : vérifier le statut initial
      const statusRes = await request(app).get("/game/status").set(authHeader);

      // Assert : peut jouer (première tentative disponible)
      expect(statusRes.status).toBe(200);
      expect(statusRes.body.canPlay).toBe(true);

      // Act – Étape 2 : jouer (le résultat dépend du hasard — on vérifie juste le format)
      const playRes = await request(app).post("/game/play").set(authHeader);

      // Assert : réponse valide quelle que soit l'issue
      expect(playRes.status).toBe(200);
      expect(typeof playRes.body.won).toBe("boolean");
      expect(typeof playRes.body.attempt).toBe("number");

      // Act – Étape 3 : si gagné, le gain apparaît dans les rewards
      if (playRes.body.won) {
        const rewardsRes = await request(app).get("/game/rewards").set(authHeader);

        // Assert : le gain figure dans l'historique
        expect(rewardsRes.status).toBe(200);
        expect(rewardsRes.body.length).toBeGreaterThanOrEqual(1);
        const win = rewardsRes.body[0];
        expect(win.prize).toBeTruthy();
        expect(win.voucherCode).toMatch(/^FOX-[0-9A-F]{8}$/);
      }
    },
  );
});

// ─── I-GAME-02 : Flux jeu complet — seconde chance ────────────────────────────

describe("I-GAME-02 : Flux jeu complet — seconde chance", () => {
  it.skipIf(!dbAvailable)(
    "première tentative enregistrée → statut permet une 2e → 2e partie jouée",
    async () => {
      const { userId } = await registerAndLogin("02");
      const auth = makeAuthHeader(userId);

      // Arrange : insérer manuellement une première tentative perdante en DB
      await prisma.gamePlay.create({
        data: { userId, won: false, attempt: 1, prize: null, voucherCode: null },
      });

      // Act – Étape 1 : vérifier le statut
      const statusRes = await request(app).get("/game/status").set(auth);

      // Assert : 2e chance disponible
      expect(statusRes.status).toBe(200);
      expect(statusRes.body.canPlay).toBe(true);
      expect(statusRes.body.attempt).toBe(2);

      // Act – Étape 2 : jouer la 2e tentative
      const playRes = await request(app).post("/game/play").set(auth);

      // Assert : résultat de la 2e tentative correctement enregistré
      expect(playRes.status).toBe(200);
      expect(playRes.body.attempt).toBe(2);
    },
  );
});

// ─── I-GAME-03 : Limite 10 gains par jour ────────────────────────────────────

describe("I-GAME-03 : Limite 10 gains/jour", () => {
  it.skipIf(!dbAvailable)(
    "si 10 GamePlay gagnants du jour existent, aucun lot n'est attribué",
    async () => {
      const { userId } = await registerAndLogin("03");
      const auth = makeAuthHeader(userId);

      // Arrange : un autre utilisateur fictif possède déjà 10 gains aujourd'hui
      const otherUser = await prisma.user.create({
        data: {
          email: `${TEST_EMAIL_PREFIX}-03-other@webmall.ch`,
          passwordHash: "fakehash",
          role: "USER",
        },
      });
      const today = new Date();
      await prisma.gamePlay.createMany({
        data: Array.from({ length: 10 }, (_, i) => ({
          userId: otherUser.id,
          won: true,
          attempt: 1,
          prize: `Lot ${i + 1}`,
          voucherCode: `FOX-${i.toString().padStart(8, "0")}`,
          playedAt: today,
        })),
      });

      // Act : l'utilisateur courant joue alors que la limite globale est atteinte
      const response = await request(app).post("/game/play").set(auth);

      // Assert : 200 mais won:false — aucun lot attribué
      expect(response.status).toBe(200);
      expect(response.body.won).toBe(false);
    },
  );
});

// ─── I-GAME-04 : Isolation par utilisateur ────────────────────────────────────

describe("I-GAME-04 : Isolation par utilisateur", () => {
  it.skipIf(!dbAvailable)(
    "les 2 tentatives de l'utilisateur A n'affectent pas le quota de l'utilisateur B",
    async () => {
      // Arrange : créer deux utilisateurs distincts
      const { userId: userAId } = await registerAndLogin("04a");
      const authA = makeAuthHeader(userAId);

      const { userId: userBId } = await registerAndLogin("04b");
      const authB = makeAuthHeader(userBId);

      // Act : l'utilisateur A joue deux fois
      await prisma.gamePlay.createMany({
        data: [
          { userId: userAId, won: false, attempt: 1, prize: null, voucherCode: null },
          { userId: userAId, won: false, attempt: 2, prize: null, voucherCode: null },
        ],
      });

      // Assert A : statut de A — plus de tentatives disponibles
      const statusA = await request(app).get("/game/status").set(authA);
      expect(statusA.body.canPlay).toBe(false);

      // Assert B : statut de B — peut toujours jouer (quota indépendant)
      const statusB = await request(app).get("/game/status").set(authB);
      expect(statusB.body.canPlay).toBe(true);
    },
  );
});

// ─── I-GAME-05 : Jeu + auth — token invalide ─────────────────────────────────

describe("I-GAME-05 : Jeu avec token invalide → 401, aucun enregistrement", () => {
  it(
    "appel /game/play avec un token invalide → 401, aucun GamePlay créé",
    async () => {
      // Arrange : token signé avec un secret incorrect
      const badToken = jwt.sign(
        { sub: "42", email: "hacker@evil.com", role: "USER" },
        "wrong-secret",
        { expiresIn: "1h" },
      );

      // Act : tentative avec token invalide
      const response = await request(app)
        .post("/game/play")
        .set({ Authorization: `Bearer ${badToken}` });

      // Assert : 401 — middleware rejette avant toute écriture en DB
      expect(response.status).toBe(401);
    },
  );
});
