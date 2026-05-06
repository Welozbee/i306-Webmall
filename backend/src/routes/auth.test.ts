import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import type { Request, Response, NextFunction } from "express";

// ─── Mocks ────────────────────────────────────────────────────────────────────
// On isole les dépendances externes avant toute importation de module.

vi.mock("../prisma", () => ({
  default: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

vi.mock("../middlewares/logger", () => ({
  default: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

import app from "../app";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Prisma } from "../../generated/prisma/client";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const validCredentials = { email: "test@webmall.ch", password: "Password123!" };

const userRecord = {
  id: 1,
  email: "test@webmall.ch",
  passwordHash: "$2a$10$hashedpassword",
  role: "USER" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const refreshTokenRecord = {
  id: 42,
  userId: 1,
  tokenHash: "stored-sha256-hash",
  revokedAt: null,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  user: userRecord,
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetAllMocks();
  process.env.JWT_SECRET = "test-secret-key";

  // Implémentations par défaut rétablies après le reset
  vi.mocked(jwt.sign).mockReturnValue("mock-access-token" as never);
  vi.mocked(bcrypt.hash).mockResolvedValue("$2a$10$hashedpassword" as never);
  vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
  vi.mocked(prisma.$queryRaw).mockResolvedValue([] as never);
  vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as never);
  vi.mocked(prisma.refreshToken.update).mockResolvedValue({} as never);
  vi.mocked(prisma.refreshToken.updateMany).mockResolvedValue({ count: 1 } as never);
});

// ─── POST /auth/register ──────────────────────────────────────────────────────

describe("POST /auth/register", () => {
  it("U-AUTH-01 : crée un compte avec email valide et mot de passe ≥8 chars", async () => {
    // Arrange : la DB accepte la création de l'utilisateur
    vi.mocked(prisma.user.create).mockResolvedValue(userRecord as never);

    // Act : inscription avec des données valides
    const response = await request(app)
      .post("/auth/register")
      .send(validCredentials);

    // Assert : 201 + utilisateur créé + tokens retournés
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      user: { id: 1, email: "test@webmall.ch", role: "USER" },
      accessToken: "mock-access-token",
      refreshToken: expect.any(String),
    });
  });

  it("U-AUTH-02 : retourne 409 avec message explicite si l'email est déjà utilisé", async () => {
    // Arrange : la DB rejette avec une contrainte d'unicité (code P2002)
    const uniqueConstraintError = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed on the fields: (`email`)",
      { code: "P2002", clientVersion: "7.3.0" },
    );
    vi.mocked(prisma.user.create).mockRejectedValue(uniqueConstraintError);

    // Act : tentative d'inscription avec un email déjà pris
    const response = await request(app)
      .post("/auth/register")
      .send(validCredentials);

    // Assert : 409 + message d'erreur présent
    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("error");
  });

  it("U-AUTH-03 : retourne 400 si l'email est invalide", async () => {
    // Arrange : email sans @ ni domaine
    const body = { email: "notanemail", password: "Password123!" };

    // Act : inscription avec email malformé
    const response = await request(app).post("/auth/register").send(body);

    // Assert : validation rejetée avant tout appel DB
    expect(response.status).toBe(400);
    expect(vi.mocked(prisma.user.create)).not.toHaveBeenCalled();
  });

  it("U-AUTH-04 : retourne 400 si le mot de passe est trop court", async () => {
    // Arrange : mot de passe < 8 caractères
    const body = { email: "test@webmall.ch", password: "abc" };

    // Act : inscription avec mot de passe trop court
    const response = await request(app).post("/auth/register").send(body);

    // Assert : validation rejetée avant tout appel DB
    expect(response.status).toBe(400);
    expect(vi.mocked(prisma.user.create)).not.toHaveBeenCalled();
  });

  it("U-AUTH-05 : retourne 400 si les champs sont manquants", async () => {
    // Arrange : body entièrement vide

    // Act : inscription sans email ni mot de passe
    const response = await request(app).post("/auth/register").send({});

    // Assert : validation rejetée
    expect(response.status).toBe(400);
  });

  it("U-AUTH-06 : assigne le rôle USER par défaut", async () => {
    // Arrange : mock DB prêt à créer l'utilisateur
    vi.mocked(prisma.user.create).mockResolvedValue(userRecord as never);

    // Act : inscription normale sans spécification de rôle
    await request(app).post("/auth/register").send(validCredentials);

    // Assert : prisma.user.create appelé avec role = USER
    expect(vi.mocked(prisma.user.create)).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: "USER" }),
      }),
    );
  });
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────

describe("POST /auth/login", () => {
  it("U-AUTH-07 : retourne accessToken + refreshToken pour des identifiants corrects", async () => {
    // Arrange : utilisateur trouvé en DB, mot de passe valide
    vi.mocked(prisma.user.findUnique).mockResolvedValue(userRecord as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    // Act : connexion avec identifiants corrects
    const response = await request(app)
      .post("/auth/login")
      .send(validCredentials);

    // Assert : 200 + paire de tokens
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      accessToken: "mock-access-token",
      refreshToken: expect.any(String),
    });
  });

  it("U-AUTH-08 : retourne 401 si le mot de passe est incorrect", async () => {
    // Arrange : utilisateur trouvé mais mot de passe ne correspond pas
    vi.mocked(prisma.user.findUnique).mockResolvedValue(userRecord as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    // Act : connexion avec mauvais mot de passe
    const response = await request(app)
      .post("/auth/login")
      .send({ email: validCredentials.email, password: "WrongPassword!" });

    // Assert : 401 non autorisé
    expect(response.status).toBe(401);
  });

  it("U-AUTH-09 : retourne 401 pour un email inconnu sans révéler d'information", async () => {
    // Arrange : aucun utilisateur trouvé pour cet email
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    // Act : connexion avec un email qui n'existe pas
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "ghost@webmall.ch", password: "Password123!" });

    // Assert : même message que mot de passe incorrect → pas de fuite d'information
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid credentials");
  });

  it("U-AUTH-10 : stocke le refresh token haché (SHA-256), jamais en clair", async () => {
    // Arrange : connexion réussie
    vi.mocked(prisma.user.findUnique).mockResolvedValue(userRecord as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    // Act : connexion → récupération du refreshToken brut retourné au client
    const response = await request(app)
      .post("/auth/login")
      .send(validCredentials);
    const rawRefreshToken: string = response.body.refreshToken;

    // Assert : le hash en DB diffère du token brut (jamais stocké en clair)
    const createCall = vi.mocked(prisma.refreshToken.create).mock.calls[0][0];
    expect(createCall.data.tokenHash).not.toBe(rawRefreshToken);
    expect(createCall.data.tokenHash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex = 64 chars
  });
});

// ─── POST /auth/refresh ───────────────────────────────────────────────────────

describe("POST /auth/refresh", () => {
  // Token brut de 96 chars (= 48 octets hex), format réaliste
  const rawToken = "a".repeat(96);

  it("U-AUTH-11 : retourne une nouvelle paire de tokens pour un refresh token valide", async () => {
    // Arrange : token présent en DB, non révoqué, non expiré
    vi.mocked(prisma.refreshToken.findFirst).mockResolvedValue(refreshTokenRecord as never);

    // Act : rotation du refresh token
    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: rawToken });

    // Assert : 200 + nouvelle paire de tokens
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      accessToken: "mock-access-token",
      refreshToken: expect.any(String),
    });
  });

  it("U-AUTH-12 : retourne 401 pour un token révoqué", async () => {
    // Arrange : findFirst retourne null car le filtre revokedAt: null exclut le token révoqué
    vi.mocked(prisma.refreshToken.findFirst).mockResolvedValue(null);

    // Act : tentative de refresh avec un token révoqué
    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: rawToken });

    // Assert : 401 refusé
    expect(response.status).toBe(401);
  });

  it("U-AUTH-13 : retourne 401 pour un token expiré", async () => {
    // Arrange : findFirst retourne null car le filtre expiresAt: { gt: now } exclut le token expiré
    vi.mocked(prisma.refreshToken.findFirst).mockResolvedValue(null);

    // Act : tentative de refresh avec un token expiré
    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: rawToken });

    // Assert : 401 refusé
    expect(response.status).toBe(401);
  });

  it("U-AUTH-14 : retourne 401 pour un hash de token inexistant en base", async () => {
    // Arrange : aucun enregistrement ne correspond au hash calculé
    vi.mocked(prisma.refreshToken.findFirst).mockResolvedValue(null);

    // Act : tentative de refresh avec un token inconnu
    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: "completely-unknown-token" });

    // Assert : 401 refusé
    expect(response.status).toBe(401);
  });

  it("U-AUTH-15 : révoque l'ancien token en base après rotation réussie", async () => {
    // Arrange : token valide trouvé en DB
    vi.mocked(prisma.refreshToken.findFirst).mockResolvedValue(refreshTokenRecord as never);

    // Act : rotation du refresh token
    await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: rawToken });

    // Assert : l'ancien token est marqué revokedAt non null
    expect(vi.mocked(prisma.refreshToken.update)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: refreshTokenRecord.id },
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
      }),
    );
  });

  it("U-AUTH-16 : retourne 401 pour un token malformé (chaîne non-JWT)", async () => {
    // Arrange : la chaîne "abc" produit un hash SHA-256 qui n'existe pas en DB
    vi.mocked(prisma.refreshToken.findFirst).mockResolvedValue(null);

    // Act : tentative de refresh avec une chaîne quelconque
    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: "abc" });

    // Assert : 401 refusé
    expect(response.status).toBe(401);
  });

  it("U-AUTH-17 : retourne 400 si le body ne contient pas de refreshToken", async () => {
    // Arrange : body vide, aucun token fourni

    // Act : appel sans refreshToken
    const response = await request(app).post("/auth/refresh").send({});

    // Assert : 400 avant toute interrogation de la DB
    expect(response.status).toBe(400);
    expect(vi.mocked(prisma.refreshToken.findFirst)).not.toHaveBeenCalled();
  });
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────

describe("POST /auth/logout", () => {
  const rawToken = "a".repeat(96);

  it("U-AUTH-18 : révoque le token et retourne 200", async () => {
    // Arrange : updateMany simulé pour confirmer la révocation
    vi.mocked(prisma.refreshToken.updateMany).mockResolvedValue({ count: 1 } as never);

    // Act : déconnexion avec un refresh token valide
    const response = await request(app)
      .post("/auth/logout")
      .send({ refreshToken: rawToken });

    // Assert : 200 + token révoqué en DB
    expect(response.status).toBe(200);
    expect(vi.mocked(prisma.refreshToken.updateMany)).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
      }),
    );
  });

  it("U-AUTH-19 : comportement idempotent – déconnexion d'un token déjà révoqué", async () => {
    // Arrange : updateMany affecte 0 lignes (token déjà révoqué ou inconnu)
    vi.mocked(prisma.refreshToken.updateMany).mockResolvedValue({ count: 0 } as never);

    // Act : seconde déconnexion avec le même token
    const response = await request(app)
      .post("/auth/logout")
      .send({ refreshToken: rawToken });

    // Assert : pas d'erreur serveur, comportement idempotent (200 ou 401 acceptés)
    expect([200, 401]).toContain(response.status);
  });
});
