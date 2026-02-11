import { Router, type Request, type Response } from "express";
import crypto from "node:crypto";
import prisma from "../prisma";
import { authenticate } from "../middlewares/auth";
import { publishWinEvent, subscribeToWinEvents } from "../events/winEvents";

const router = Router();

const MAX_PRIZES_PER_DAY = 10;
const WIN_PROBABILITY = 0.3; // 30% chance

function startOfDay(): Date {
  // Le jeu est journalier: ce repère sert à compter les tentatives du jour.
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function generateVoucherCode(): string {
  // Génère un code lisible côté client/caisse, avec assez d'entropie pour éviter les collisions.
  return "FOX-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

router.get("/wins/stream", (_req: Request, res: Response) => {
  // Connexion SSE persistante pour pousser les événements de gains.
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  // Demande au navigateur de se reconnecter en cas de coupure.
  res.write("retry: 5000\n\n");

  const unsubscribe = subscribeToWinEvents(res);
  // Heartbeat pour garder la connexion ouverte côté proxy/navigateur.
  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 25000);

  res.on("close", () => {
    // Nettoyage quand le client quitte la page.
    clearInterval(heartbeat);
    unsubscribe();
  });
});

router.get("/status", authenticate, async (req: Request, res: Response) => {
  // Retourne l'état du jeu du jour pour piloter l'UI (jouable, tentative, lots restants).
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

  const firstPlay = todaysPlays[0];
  const hasPlayed = todaysPlays.length > 0;
  const firstPlayLost = todaysPlays.length === 1 && firstPlay ? !firstPlay.won : false;
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

router.get("/rewards", authenticate, async (req: Request, res: Response) => {
  // Historique personnel des gains, affiché sur la page "Mes récompenses".
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

router.post("/play", authenticate, async (req: Request, res: Response) => {
  // Exécute une tentative de jeu en appliquant toutes les règles métier quotidiennes.
  const userId = req.user!.id;
  const todayStart = startOfDay();

  // Règle métier: on contrôle les parties du jour pour cet utilisateur.
  const todaysPlays = await prisma.gamePlay.findMany({
    where: {
      userId,
      playedAt: { gte: todayStart },
    },
    orderBy: { playedAt: "asc" },
  });

  // Règle métier: maximum 2 tentatives par jour (2e chance uniquement après un échec).
  if (todaysPlays.length >= 2) {
    res.status(400).json({ error: "Vous avez déjà utilisé vos deux tentatives aujourd'hui." });
    return;
  }

  // Règle métier: si la 1re tentative gagne, la 2e tentative est interdite.
  const firstPlayToday = todaysPlays[0];
  if (todaysPlays.length === 1 && firstPlayToday?.won) {
    res.status(400).json({ error: "Vous avez déjà gagné aujourd'hui !" });
    return;
  }

  // Règle métier: limite quotidienne globale de gains.
  const todaysPrizeCount = await prisma.gamePlay.count({
    where: {
      won: true,
      playedAt: { gte: todayStart },
    },
  });

  const prizesAvailable = todaysPrizeCount < MAX_PRIZES_PER_DAY;
  const attempt = todaysPlays.length + 1;

  // Tirage du résultat en respectant les règles de disponibilité.
  const won = prizesAvailable && Math.random() < WIN_PROBABILITY;

  let prizeName: string | null = null;
  let voucherCode: string | null = null;

  if (won) {
    // Seuls les lots actifs et encore en stock peuvent être attribués.
    const allPrizes = await prisma.prize.findMany({ where: { active: true } });
    const validPrizes = allPrizes.filter((p) => p.claimed < p.quantity);

    if (validPrizes.length > 0) {
      const selectedPrize = validPrizes[Math.floor(Math.random() * validPrizes.length)];
      if (selectedPrize) {
        prizeName = selectedPrize.name;
        voucherCode = generateVoucherCode();

        await prisma.prize.update({
          where: { id: selectedPrize.id },
          data: { claimed: { increment: 1 } },
        });
      }
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

  if (gamePlay.won && gamePlay.prize) {
    // Émet un événement uniquement pour un vrai gain enregistré.
    publishWinEvent({
      id: crypto.randomUUID(),
      message: `Un visiteur vient de gagner: ${gamePlay.prize}`,
      prize: gamePlay.prize,
      wonAt: gamePlay.playedAt.toISOString(),
    });
  }

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
