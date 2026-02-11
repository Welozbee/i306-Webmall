import { Router, type Request, type Response } from "express";
import prisma from "../prisma";
import { authenticate, authorize } from "../middlewares/auth";
import { Role } from "../../generated/prisma/client";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const parkings = await prisma.parking.findMany({
    orderBy: { name: "asc" },
  });
  res.json(parkings);
});

router.put(
  "/:id",
  authenticate,
  authorize(Role.EMPLOYEE, Role.ADMIN),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { availableSpaces, totalSpaces } = req.body;

    if (availableSpaces !== undefined && (typeof availableSpaces !== "number" || availableSpaces < 0)) {
      res.status(400).json({ error: "availableSpaces must be a non-negative number" });
      return;
    }

    if (totalSpaces !== undefined && (typeof totalSpaces !== "number" || totalSpaces < 0)) {
      res.status(400).json({ error: "totalSpaces must be a non-negative number" });
      return;
    }

    try {
      const parking = await prisma.parking.update({
        where: { id },
        data: {
          ...(availableSpaces !== undefined && { availableSpaces }),
          ...(totalSpaces !== undefined && { totalSpaces }),
        },
      });
      res.json(parking);
    } catch {
      res.status(404).json({ error: "Parking not found" });
    }
  }
);

export default router;
