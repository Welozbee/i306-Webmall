import { Router, type Request, type Response } from "express";
import crypto from "node:crypto";
import prisma from "../prisma";
import { authenticate } from "../middlewares/auth";

const router = Router();

const MAX_PRIZES_PER_DAY = 10;
const WIN_PROBABILITY = 0.3; // 30% chance

function startOfDay(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function generateVoucherCode(): string {
  return "FOX-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

// GET /game/status - Check if user can play today
router.get("/status", authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const todayStart = startOfDay();

  const todaysPlays = await prisma.gamePlay.findMany({
    where: {
      userId,
      playedAt: { gte: todayStart },
    },
    orderBy: { playedAt: "asc" },
  });

  const todaysPrizes = await prisma.gamePlay.count({
    where: {
      won: true,
      playedAt: { gte: todayStart },
    },
  });

  const hasPlayed = todaysPlays.length > 0;
  const firstPlayLost = todaysPlays.length === 1 && !todaysPlays[0].won;
  const canPlay = todaysPlays.length === 0 || firstPlayLost;
  const attempt = todaysPlays.length === 0 ? 1 : 2;
  const prizesLeft = MAX_PRIZES_PER_DAY - todaysPrizes;

  res.json({
    canPlay,
    attempt,
    hasPlayed,
    todaysPlays: todaysPlays.map((p) => ({
      won: p.won,
      prize: p.prize,
      voucherCode: p.voucherCode,
      attempt: p.attempt,
    })),
    prizesRemainingToday: Math.max(0, prizesLeft),
  });
});

// GET /game/rewards - Get all rewards for the logged-in user
router.get("/rewards", authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const rewards = await prisma.gamePlay.findMany({
    where: { userId, won: true },
    orderBy: { playedAt: "desc" },
  });

  res.json(
    rewards.map((r) => ({
      id: r.id,
      prize: r.prize,
      voucherCode: r.voucherCode,
      playedAt: r.playedAt,
    }))
  );
});

// POST /game/play - Play the scratch card game
router.post("/play", authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const todayStart = startOfDay();

  // Check today's plays for this user
  const todaysPlays = await prisma.gamePlay.findMany({
    where: {
      userId,
      playedAt: { gte: todayStart },
    },
    orderBy: { playedAt: "asc" },
  });

  // Rule: max 2 plays per day (1st + 2nd chance if lost)
  if (todaysPlays.length >= 2) {
    res.status(400).json({ error: "Vous avez déjà utilisé vos deux tentatives aujourd'hui." });
    return;
  }

  // If first play was a win, no second play
  if (todaysPlays.length === 1 && todaysPlays[0].won) {
    res.status(400).json({ error: "Vous avez déjà gagné aujourd'hui !" });
    return;
  }

  // Check daily prize limit
  const todaysPrizeCount = await prisma.gamePlay.count({
    where: {
      won: true,
      playedAt: { gte: todayStart },
    },
  });

  const prizesAvailable = todaysPrizeCount < MAX_PRIZES_PER_DAY;
  const attempt = todaysPlays.length + 1;

  // Determine win/loss
  const won = prizesAvailable && Math.random() < WIN_PROBABILITY;

  let prizeName: string | null = null;
  let voucherCode: string | null = null;

  if (won) {
    // Get active prizes where claimed < quantity
    const allPrizes = await prisma.prize.findMany({ where: { active: true } });
    const validPrizes = allPrizes.filter((p) => p.claimed < p.quantity);

    if (validPrizes.length > 0) {
      const selectedPrize = validPrizes[Math.floor(Math.random() * validPrizes.length)];
      prizeName = selectedPrize.name;
      voucherCode = generateVoucherCode();

      await prisma.prize.update({
        where: { id: selectedPrize.id },
        data: { claimed: { increment: 1 } },
      });
    }
  }

  const didWin = won && prizeName !== null;

  const gamePlay = await prisma.gamePlay.create({
    data: {
      userId,
      won: didWin,
      attempt,
      prize: prizeName,
      voucherCode: didWin ? voucherCode : null,
    },
  });

  const canPlayAgain = !gamePlay.won && attempt === 1;

  res.json({
    won: gamePlay.won,
    prize: gamePlay.prize,
    voucherCode: gamePlay.voucherCode,
    attempt,
    canPlayAgain,
    message: gamePlay.won
      ? `Félicitations ! Vous avez gagné : ${gamePlay.prize}`
      : canPlayAgain
        ? "Pas de chance ! Vous pouvez tenter une deuxième fois."
        : "Pas de chance ! Revenez demain pour retenter votre chance.",
  });
});

export default router;
