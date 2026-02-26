import express from "express";
import { Prisma, Role } from "../../generated/prisma/client";
import { authenticate, authorize } from "../middlewares/auth";
import prisma from "../prisma";

const router = express.Router();

const AMOUNTS = [10, 15, 20, 25, 30, 50];

router.get("/", authenticate, authorize(Role.ADMIN), async (_req, res) => {
  const prizes = await prisma.prize.findMany({ orderBy: { createdAt: "desc" } });
  res.status(200).json(prizes);
});

router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  async (req, res) => {
    const { name, description, shopName, quantity } = req.body ?? {};

    if (!name || !description || !shopName || quantity === undefined) {
      res.status(400).json({ error: "Missing required fields: name, description, shopName, quantity" });
      return;
    }

    if (typeof quantity !== "number" || quantity < 1) {
      res.status(400).json({ error: "Field 'quantity' must be a positive number" });
      return;
    }

    const prize = await prisma.prize.create({
      data: { name, description, shopName, quantity },
    });

    res.status(201).json(prize);
  },
);

router.post(
  "/generate",
  authenticate,
  authorize(Role.ADMIN),
  async (req, res) => {
    const { count = 5 } = req.body ?? {};

    if (typeof count !== "number" || count < 1 || count > 20) {
      res.status(400).json({ error: "Field 'count' must be a number between 1 and 20" });
      return;
    }

    const shops = await prisma.shop.findMany({ select: { name: true } });

    if (shops.length === 0) {
      res.status(400).json({ error: "No shops found to generate prizes from" });
      return;
    }

    const created = await Promise.all(
      Array.from({ length: count }, () => {
        const shop = shops[Math.floor(Math.random() * shops.length)]!;
        const amount = AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)]!;
        return prisma.prize.create({
          data: {
            name: `Bon d'achat ${shop.name} ${amount} CHF`,
            description: "Grattez et gagnez !",
            shopName: shop.name,
            quantity: 10,
          },
        });
      }),
    );

    res.status(201).json(created);
  },
);

router.put(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid prize id" });
      return;
    }

    const { name, description, shopName, quantity, active } = req.body ?? {};
    const data: Prisma.PrizeUpdateInput = {};

    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (shopName !== undefined) data.shopName = shopName;
    if (quantity !== undefined) {
      if (typeof quantity !== "number" || quantity < 1) {
        res.status(400).json({ error: "Field 'quantity' must be a positive number" });
        return;
      }
      data.quantity = quantity;
    }
    if (active !== undefined) data.active = active;

    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    try {
      const prize = await prisma.prize.update({ where: { id }, data });
      res.status(200).json(prize);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        res.status(404).json({ error: "Prize not found" });
        return;
      }
      res.status(500).json({ error: "Failed to update prize" });
    }
  },
);

router.delete(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid prize id" });
      return;
    }

    try {
      await prisma.prize.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        res.status(404).json({ error: "Prize not found" });
        return;
      }
      res.status(500).json({ error: "Failed to delete prize" });
    }
  },
);

export default router;
