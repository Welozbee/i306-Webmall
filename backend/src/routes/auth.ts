import express from "express";
import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { Prisma, Role } from "../../generated/prisma/client";
import prisma from "../prisma";

const router = express.Router();
const passwordSaltRounds = 10;

function getJwtSecret(): Secret {
  return process.env.JWT_SECRET ?? "";
}

function getJwtExpiresIn(): SignOptions["expiresIn"] {
  const raw = process.env.JWT_EXPIRES_IN;
  if (!raw) return "1h";
  if (/^\d+$/.test(raw)) return Number(raw);
  return raw as SignOptions["expiresIn"];
}

function getRefreshTokenTtlDays() {
  const raw = process.env.REFRESH_TOKEN_TTL_DAYS ?? "7";
  const days = Number(raw);
  return Number.isFinite(days) && days > 0 ? days : 7;
}

function isValidEmail(email: string) {
  return email.includes("@") && email.includes(".");
}

function hashRefreshToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createAccessToken(user: { id: number; email: string; role: Role }) {
  return jwt.sign(
    { sub: user.id.toString(), role: user.role, email: user.email },
    getJwtSecret(),
    { expiresIn: getJwtExpiresIn() },
  );
}

async function createRefreshToken(userId: number) {
  const rawToken = crypto.randomBytes(48).toString("hex");
  const tokenHash = hashRefreshToken(rawToken);
  const ttlDays = getRefreshTokenTtlDays();
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return rawToken;
}

async function issueTokens(user: { id: number; email: string; role: Role }) {
  const accessToken = createAccessToken(user);
  const refreshToken = await createRefreshToken(user.id);
  return { accessToken, refreshToken };
}

router.post("/register", async (req, res) => {
  const { email, password } = req.body ?? {};
  const normalizedEmail = typeof email === "string" ? email.trim() : "";
  const normalizedPassword = typeof password === "string" ? password : "";

  if (!normalizedEmail || !normalizedPassword) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  if (!isValidEmail(normalizedEmail)) {
    res.status(400).json({ error: "Invalid email" });
    return;
  }

  if (normalizedPassword.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    res.status(500).json({ error: "JWT secret not configured" });
    return;
  }

  const passwordHash = await bcrypt.hash(normalizedPassword, passwordSaltRounds);
  const emailLower = normalizedEmail.toLowerCase();

  try {
    const user = await prisma.user.create({
      data: {
        email: emailLower,
        passwordHash,
        role: Role.USER,
      },
    });

    const { accessToken, refreshToken } = await issueTokens(user);

    res.status(201).json({
      token: accessToken,
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({ error: "Email already exists" });
      return;
    }
    res.status(500).json({ error: "Failed to register user" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  const normalizedEmail = typeof email === "string" ? email.trim() : "";
  const normalizedPassword = typeof password === "string" ? password : "";

  if (!normalizedEmail || !normalizedPassword) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    res.status(500).json({ error: "JWT secret not configured" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail.toLowerCase() },
  });

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const validPassword = await bcrypt.compare(
    normalizedPassword,
    user.passwordHash,
  );
  if (!validPassword) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const { accessToken, refreshToken } = await issueTokens(user);

  res.status(200).json({
    token: accessToken,
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role },
  });
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body ?? {};
  const rawToken = typeof refreshToken === "string" ? refreshToken : "";

  if (!rawToken) {
    res.status(400).json({ error: "Refresh token is required" });
    return;
  }

  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    res.status(500).json({ error: "JWT secret not configured" });
    return;
  }

  const tokenHash = hashRefreshToken(rawToken);
  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!storedToken) {
    res.status(401).json({ error: "Invalid refresh token" });
    return;
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  const { accessToken, refreshToken: newRefreshToken } = await issueTokens(
    storedToken.user,
  );

  res.status(200).json({
    token: accessToken,
    accessToken,
    refreshToken: newRefreshToken,
  });
});

router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body ?? {};
  const rawToken = typeof refreshToken === "string" ? refreshToken : "";

  if (!rawToken) {
    res.status(400).json({ error: "Refresh token is required" });
    return;
  }

  const tokenHash = hashRefreshToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  res.status(204).send();
});

export default router;
