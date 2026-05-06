import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../prisma", () => ({
  default: {
    gamePlay: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    prize: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

vi.mock("../events/winEvents", () => ({
  publishWinEvent: vi.fn(),
  subscribeToWinEvents: vi.fn(() => () => {}),
}));

vi.mock("../middlewares/logger", () => ({
  default: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

import app from "../app";
import prisma from "../prisma";
import { publishWinEvent } from "../events/winEvents";

// ─── Configuration ─────────────────────────────────────────────────────────────

const JWT_SECRET = "game-test-secret";
process.env.JWT_SECRET = JWT_SECRET;

// Instant de référence : tous les timers fictifs sont ancrés sur cette date
const FAKE_NOW = new Date("2026-05-06T10:00:00.000Z");

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const activePrize = {
  id: 1,
  name: "Bon Migros 50CHF",
  shopName: "Migros",
  description: "Bon valable en boutique",
  quantity: 10,
  claimed: 0,
  active: true,
  createdAt: FAKE_NOW,
  updatedAt: FAKE_NOW,
};

function makePlay(overrides: Partial<{
  id: number; won: boolean; attempt: number;
  prize: string | null; voucherCode: string | null; playedAt: Date;
}> = {}) {
  return {
    id: 1, userId: 1, won: false, attempt: 1,
    prize: null, voucherCode: null, playedAt: FAKE_NOW,
    ...overrides,
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

let authHeader: { Authorization: string };

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FAKE_NOW);
  vi.resetAllMocks();

  // Token généré après activation des timers fictifs pour que exp soit cohérent
  const token = jwt.sign(
    { sub: "1", email: "player@webmall.ch", role: "USER" },
    JWT_SECRET,
    { expiresIn: "1h" },
  );
  authHeader = { Authorization: `Bearer ${token}` };

  // Implémentations par défaut (sécurité si un test oublie de configurer le mock)
  vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
  vi.mocked(prisma.gamePlay.findMany).mockResolvedValue([]);
  vi.mocked(prisma.gamePlay.count).mockResolvedValue(0);
  vi.mocked(prisma.gamePlay.create).mockImplementation(async (args: any) => ({
    id: 1,
    userId: args.data.userId,
    won: args.data.won,
    attempt: args.data.attempt,
    prize: args.data.prize ?? null,
    voucherCode: args.data.voucherCode ?? null,
    playedAt: FAKE_NOW,
  }));
  vi.mocked(prisma.prize.findMany).mockResolvedValue([]);
  vi.mocked(prisma.prize.update).mockResolvedValue({} as never);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ─── POST /game/play ──────────────────────────────────────────────────────────

describe("POST /game/play", () => {
  it("U-GAME-01 : première tentative gagnante — retourne won:true et un voucherCode", async () => {
    // Arrange : aucune tentative du jour, lots disponibles, tirage gagnant (0,1 < 0,3)
    vi.mocked(prisma.gamePlay.findMany).mockResolvedValue([]);
    vi.mocked(prisma.gamePlay.count).mockResolvedValue(0);
    vi.mocked(prisma.prize.findMany).mockResolvedValue([activePrize as never]);
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.1)  // tirage gagnant (< WIN_PROBABILITY = 0.3)
      .mockReturnValueOnce(0);   // sélection du lot : index 0

    // Act : première tentative de jeu
    const response = await request(app)
      .post("/game/play")
      .set(authHeader);

    // Assert : gain confirmé avec les métadonnées attendues
    expect(response.status).toBe(200);
    expect(response.body.won).toBe(true);
    expect(response.body.attempt).toBe(1);
    expect(response.body.voucherCode).toBeTruthy();
    expect(response.body.canPlayAgain).toBe(false);
  });

  it("U-GAME-02 : première tentative perdante — retourne won:false et droit à une 2e chance", async () => {
    // Arrange : aucune tentative du jour, tirage perdant (0,5 >= 0,3)
    vi.mocked(prisma.gamePlay.findMany).mockResolvedValue([]);
    vi.mocked(prisma.gamePlay.count).mockResolvedValue(0);
    vi.spyOn(Math, "random").mockReturnValue(0.5); // perte

    // Act : première tentative
    const response = await request(app)
      .post("/game/play")
      .set(authHeader);

    // Assert : perdu mais 2e chance accordée
    expect(response.status).toBe(200);
    expect(response.body.won).toBe(false);
    expect(response.body.attempt).toBe(1);
    expect(response.body.canPlayAgain).toBe(true);
  });

  it("U-GAME-03 : deuxième tentative autorisée après un premier échec", async () => {
    // Arrange : une tentative perdante déjà enregistrée (attempt: 1)
    vi.mocked(prisma.gamePlay.findMany).mockResolvedValue([
      makePlay({ attempt: 1, won: false }) as never,
    ]);
    vi.mocked(prisma.gamePlay.count).mockResolvedValue(0);
    vi.spyOn(Math, "random").mockReturnValue(0.5); // perte à la 2e chance aussi

    // Act : deuxième tentative
    const response = await request(app)
      .post("/game/play")
      .set(authHeader);

    // Assert : 2e tentative traitée normalement
    expect(response.status).toBe(200);
    expect(response.body.attempt).toBe(2);
  });

  it("U-GAME-04 : deuxième tentative refusée si la première a été gagnante", async () => {
    // Arrange : une tentative gagnante déjà enregistrée
    vi.mocked(prisma.gamePlay.findMany).mockResolvedValue([
      makePlay({ attempt: 1, won: true, prize: "Bon Migros 50CHF", voucherCode: "FOX-AABB1234" }) as never,
    ]);

    // Act : tentative de re-jouer après un gain
    const response = await request(app)
      .post("/game/play")
      .set(authHeader);

    // Assert : 400 — déjà gagné aujourd'hui
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("U-GAME-05 : refus si l'utilisateur a déjà effectué deux tentatives aujourd'hui", async () => {
    // Arrange : deux tentatives déjà en base pour aujourd'hui
    vi.mocked(prisma.gamePlay.findMany).mockResolvedValue([
      makePlay({ attempt: 1, won: false }) as never,
      makePlay({ id: 2, attempt: 2, won: false }) as never,
    ]);

    // Act : tentative d'une 3e partie
    const response = await request(app)
      .post("/game/play")
      .set(authHeader);

    // Assert : 400 — limite journalière atteinte
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("U-GAME-06 : aucun lot attribué si 10 gains ont déjà été distribués aujourd'hui", async () => {
    // Arrange : 0 tentative utilisateur, mais 10 gains globaux aujourd'hui → plus de lots
    vi.mocked(prisma.gamePlay.findMany).mockResolvedValue([]);
    vi.mocked(prisma.gamePlay.count).mockResolvedValue(10); // MAX_PRIZES_PER_DAY atteint

    // Note : Math.random n'est PAS appelé (court-circuit « prizesAvailable && ... »)

    // Act : tentative alors que tous les lots sont épuisés pour la journée
    const response = await request(app)
      .post("/game/play")
      .set(authHeader);

    // Assert : 200 mais won:false — aucun lot attribué
    expect(response.status).toBe(200);
    expect(response.body.won).toBe(false);
    expect(vi.mocked(prisma.prize.findMany)).not.toHaveBeenCalled();
  });

  it("U-GAME-07 : 401 si l'utilisateur n'est pas connecté", async () => {
    // Arrange : aucun header Authorization

    // Act : tentative sans token
    const response = await request(app).post("/game/play");

    // Assert : middleware authenticate rejette la requête
    expect(response.status).toBe(401);
  });

  it("U-GAME-08 : aucun lot attribué si seuls des lots inactifs ou épuisés existent", async () => {
    // Arrange : tirage gagnant, mais prize.findMany ne retourne aucun lot actif
    vi.mocked(prisma.gamePlay.findMany).mockResolvedValue([]);
    vi.mocked(prisma.gamePlay.count).mockResolvedValue(0);
    vi.mocked(prisma.prize.findMany).mockResolvedValue([]); // filtré par active:true → aucun résultat
    vi.spyOn(Math, "random").mockReturnValueOnce(0.1); // tirage gagnant

    // Act : tentative quand il n'y a aucun lot éligible
    const response = await request(app)
      .post("/game/play")
      .set(authHeader);

    // Assert : 200 mais won:false — « won » est vrai mais prizeName reste null
    expect(response.status).toBe(200);
    expect(response.body.won).toBe(false);
    expect(response.body.voucherCode).toBeNull();
  });

  it("U-GAME-09 : le voucherCode suit le format FOX-[A-Z0-9]{8}", async () => {
    // Arrange : scénario gagnant complet
    vi.mocked(prisma.gamePlay.findMany).mockResolvedValue([]);
    vi.mocked(prisma.gamePlay.count).mockResolvedValue(0);
    vi.mocked(prisma.prize.findMany).mockResolvedValue([activePrize as never]);
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.1) // gain
      .mockReturnValueOnce(0);  // sélection du lot

    // Act : tentative gagnante
    await request(app).post("/game/play").set(authHeader);

    // Assert : le voucherCode transmis à la DB respecte le format attendu
    const createArgs = vi.mocked(prisma.gamePlay.create).mock.calls[0][0] as any;
    expect(createArgs.data.voucherCode).toMatch(/^FOX-[0-9A-F]{8}$/);
  });

  it("U-GAME-10 : le compteur claimed du lot est incrémenté de 1 lors d'un gain", async () => {
    // Arrange : scénario gagnant avec un lot actif
    vi.mocked(prisma.gamePlay.findMany).mockResolvedValue([]);
    vi.mocked(prisma.gamePlay.count).mockResolvedValue(0);
    vi.mocked(prisma.prize.findMany).mockResolvedValue([activePrize as never]);
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.1) // gain
      .mockReturnValueOnce(0);  // sélection

    // Act : tentative gagnante
    await request(app).post("/game/play").set(authHeader);

    // Assert : prize.update appelé avec l'incrémentation du claimed
    expect(vi.mocked(prisma.prize.update)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: activePrize.id },
        data: { claimed: { increment: 1 } },
      }),
    );
  });
});

// ─── GET /game/status ─────────────────────────────────────────────────────────

describe("GET /game/status", () => {
  it("U-GAME-11 : aucune tentative aujourd'hui → canPlay:true, attempt:1", async () => {
    // Arrange : aucune tentative du jour pour cet utilisateur
    vi.mocked(prisma.gamePlay.findMany).mockResolvedValue([]);
    vi.mocked(prisma.gamePlay.count).mockResolvedValue(0);

    // Act : récupération du statut
    const response = await request(app)
      .get("/game/status")
      .set(authHeader);

    // Assert : peut jouer, première tentative disponible, pas encore joué
    expect(response.status).toBe(200);
    expect(response.body.canPlay).toBe(true);
    expect(response.body.attempt).toBe(1);
    expect(response.body.hasPlayed).toBe(false);
    expect(response.body.prizesRemainingToday).toBe(10);
  });

  it("U-GAME-12 : une tentative perdante → canPlay:true (2e chance disponible)", async () => {
    // Arrange : une tentative perdante déjà enregistrée aujourd'hui
    vi.mocked(prisma.gamePlay.findMany).mockResolvedValue([
      makePlay({ attempt: 1, won: false }) as never,
    ]);
    vi.mocked(prisma.gamePlay.count).mockResolvedValue(0);

    // Act : récupération du statut après un échec
    const response = await request(app)
      .get("/game/status")
      .set(authHeader);

    // Assert : 2e chance disponible
    expect(response.status).toBe(200);
    expect(response.body.canPlay).toBe(true);
    expect(response.body.attempt).toBe(2);
    expect(response.body.hasPlayed).toBe(true);
  });

  it("U-GAME-13 : deux tentatives effectuées → canPlay:false", async () => {
    // Arrange : deux tentatives déjà jouées aujourd'hui
    vi.mocked(prisma.gamePlay.findMany).mockResolvedValue([
      makePlay({ attempt: 1, won: false }) as never,
      makePlay({ id: 2, attempt: 2, won: false }) as never,
    ]);
    vi.mocked(prisma.gamePlay.count).mockResolvedValue(0);

    // Act : récupération du statut après deux tentatives
    const response = await request(app)
      .get("/game/status")
      .set(authHeader);

    // Assert : quota journalier épuisé
    expect(response.status).toBe(200);
    expect(response.body.canPlay).toBe(false);
  });

  it("U-GAME-14 : les tentatives d'hier ne comptent pas — reset à minuit", async () => {
    // Arrange : système ancré sur FAKE_NOW (2026-05-06T10:00) ; la DB renvoie []
    //           simulant que les tentatives d'hier (< startOfDay) sont exclues du filtre
    vi.mocked(prisma.gamePlay.findMany).mockResolvedValue([]);
    vi.mocked(prisma.gamePlay.count).mockResolvedValue(0);

    // Act : récupération du statut
    const response = await request(app)
      .get("/game/status")
      .set(authHeader);

    // Assert 1 : peut jouer aujourd'hui
    expect(response.body.canPlay).toBe(true);

    // Assert 2 : la requête DB utilise bien un filtre gte = début de la journée en cours
    const findManyArgs = vi.mocked(prisma.gamePlay.findMany).mock.calls[0][0] as any;
    const gte: Date = findManyArgs.where.playedAt.gte;
    expect(gte.getFullYear()).toBe(2026);
    expect(gte.getMonth()).toBe(4);  // mai (0-indexé)
    expect(gte.getDate()).toBe(6);
    expect(gte.getHours()).toBe(0);
    expect(gte.getMinutes()).toBe(0);
  });

  it("U-GAME-15 : 401 si l'utilisateur n'est pas connecté", async () => {
    // Arrange : pas de header Authorization

    // Act : accès sans token
    const response = await request(app).get("/game/status");

    // Assert
    expect(response.status).toBe(401);
  });
});

// ─── GET /game/rewards ────────────────────────────────────────────────────────

describe("GET /game/rewards", () => {
  it("U-GAME-16 : retourne une liste vide si aucun gain enregistré", async () => {
    // Arrange : aucun gain pour cet utilisateur
    vi.mocked(prisma.gamePlay.findMany).mockResolvedValue([]);

    // Act : récupération de l'historique des gains
    const response = await request(app)
      .get("/game/rewards")
      .set(authHeader);

    // Assert : liste vide
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("U-GAME-17 : retourne la liste des gains passés de l'utilisateur", async () => {
    // Arrange : deux gains en base pour cet utilisateur
    const win1 = makePlay({ id: 1, won: true, prize: "Bon Migros 50CHF", voucherCode: "FOX-AABB1234" });
    const win2 = makePlay({ id: 2, won: true, prize: "Bon Zalando 30CHF", voucherCode: "FOX-CCDD5678" });
    vi.mocked(prisma.gamePlay.findMany).mockResolvedValue([win1, win2] as never);

    // Act : récupération de l'historique
    const response = await request(app)
      .get("/game/rewards")
      .set(authHeader);

    // Assert : les deux gains sont présents avec les bons champs
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toMatchObject({ prize: "Bon Migros 50CHF", voucherCode: "FOX-AABB1234" });
    expect(response.body[1]).toMatchObject({ prize: "Bon Zalando 30CHF", voucherCode: "FOX-CCDD5678" });
  });

  it("U-GAME-18 : les gains d'un autre utilisateur ne sont pas visibles", async () => {
    // Arrange : findMany retourne [] — le filtre userId exclut les gains des autres
    vi.mocked(prisma.gamePlay.findMany).mockResolvedValue([]);

    // Act : récupération de l'historique pour l'utilisateur courant (userId = 1)
    const response = await request(app)
      .get("/game/rewards")
      .set(authHeader);

    // Assert 1 : liste vide (aucun gain visible)
    expect(response.body).toEqual([]);

    // Assert 2 : la requête DB filtre explicitement par userId = 1
    const findManyArgs = vi.mocked(prisma.gamePlay.findMany).mock.calls[0][0] as any;
    expect(findManyArgs.where).toMatchObject({ userId: 1, won: true });
  });

  it("U-GAME-19 : 401 si l'utilisateur n'est pas connecté", async () => {
    // Arrange : pas de header Authorization

    // Act : accès sans token
    const response = await request(app).get("/game/rewards");

    // Assert
    expect(response.status).toBe(401);
  });
});
