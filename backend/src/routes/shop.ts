import express from "express";
import { Prisma, Role } from "../../generated/prisma/client";
import { authenticate, authorize } from "../middlewares/auth";
import prisma from "../prisma";

const router = express.Router();

router.get("/", async (req, res) => {
  const shops = await prisma.shop.findMany();
  res.status(200).json(shops);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid shop id" });
    return;
  }

  const shop = await prisma.shop.findUnique({ where: { id } });
  if (!shop) {
    res.status(404).json({ error: "Shop not found" });
    return;
  }

  res.status(200).json(shop);
});

router.post(
  "/",
  authenticate,
  authorize(Role.EMPLOYEE, Role.ADMIN),
  async (req, res) => {
    const { name, floor, url, logoUrl, openingHours, category, storeNumber, phone } = req.body ?? {};

    if (!name || floor === undefined || !openingHours) {
      res.status(400).json({
        error: "Missing required fields: name, floor, openingHours",
      });
      return;
    }

    if (typeof floor !== "number") {
      res.status(400).json({ error: "Field 'floor' must be a number" });
      return;
    }

    const shop = await prisma.shop.create({
      data: {
        name,
        floor,
        url: url || "",
        logoUrl: logoUrl || "",
        openingHours,
        category: category || "",
        storeNumber: storeNumber || "",
        phone: phone || "",
      },
    });

    res.status(201).json(shop);
  },
);

router.put(
  "/:id",
  authenticate,
  authorize(Role.EMPLOYEE, Role.ADMIN),
  async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid shop id" });
      return;
    }

    const { name, floor, url, logoUrl, openingHours, category, storeNumber, phone } = req.body ?? {};
    const data: Prisma.ShopUpdateInput = {};

    if (name !== undefined) data.name = name;
    if (floor !== undefined) {
      if (typeof floor !== "number") {
        res.status(400).json({ error: "Field 'floor' must be a number" });
        return;
      }
      data.floor = floor;
    }
    if (url !== undefined) data.url = url;
    if (logoUrl !== undefined) data.logoUrl = logoUrl;
    if (openingHours !== undefined) data.openingHours = openingHours;
    if (category !== undefined) data.category = category;
    if (storeNumber !== undefined) data.storeNumber = storeNumber;
    if (phone !== undefined) data.phone = phone;

    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    try {
      const shop = await prisma.shop.update({
        where: { id },
        data,
      });
      res.status(200).json(shop);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        res.status(404).json({ error: "Shop not found" });
        return;
      }
      res.status(500).json({ error: "Failed to update shop" });
    }
  },
);

router.delete(
  "/:id",
  authenticate,
  authorize(Role.EMPLOYEE, Role.ADMIN),
  async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid shop id" });
      return;
    }

    try {
      await prisma.shop.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        res.status(404).json({ error: "Shop not found" });
        return;
      }
      res.status(500).json({ error: "Failed to delete shop" });
    }
  },
);
export default router;
