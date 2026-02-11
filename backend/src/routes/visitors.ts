import { Router, type Request, type Response } from "express";
import prisma from "../prisma";
import { authenticate, authorize } from "../middlewares/auth";
import { Role } from "../../generated/prisma/client";

const router = Router();

router.post("/track", async (req: Request, res: Response) => {
  const path = typeof req.body.path === "string" ? req.body.path : "/";
  await prisma.visitorLog.create({ data: { path } });
  res.json({ ok: true });
});

router.get("/monthly", async (_req: Request, res: Response) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const count = await prisma.visitorLog.count({
    where: { visitedAt: { gte: monthStart } },
  });
  res.json({ count });
});

router.get(
  "/stats",
  authenticate,
  authorize(Role.EMPLOYEE, Role.ADMIN),
  async (_req: Request, res: Response) => {
    const now = new Date();

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayCount = await prisma.visitorLog.count({
      where: { visitedAt: { gte: todayStart } },
    });

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthCount = await prisma.visitorLog.count({
      where: { visitedAt: { gte: monthStart } },
    });

    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearCount = await prisma.visitorLog.count({
      where: { visitedAt: { gte: yearStart } },
    });

    const totalCount = await prisma.visitorLog.count();

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dailyVisits = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE("visitedAt") as date, COUNT(*) as count
      FROM "VisitorLog"
      WHERE "visitedAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("visitedAt")
      ORDER BY date DESC
    `;

    res.json({
      today: todayCount,
      thisMonth: monthCount,
      thisYear: yearCount,
      total: totalCount,
      dailyBreakdown: dailyVisits.map((d) => ({
        date: d.date,
        count: Number(d.count),
      })),
    });
  }
);

export default router;
