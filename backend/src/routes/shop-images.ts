import express from "express";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { Prisma } from "../../generated/prisma/client";
import prisma from "../prisma";

const router = express.Router();
const uploadsDir = path.resolve("uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({ storage });

router.get("/:id/images", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid shop id" });
    return;
  }

  const shop = await prisma.shop.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!shop) {
    res.status(404).json({ error: "Shop not found" });
    return;
  }

  const images = shop.images.map((image) => ({
    id: image.id,
    url: image.url,
    createdAt: image.createdAt,
    type: "image",
  }));

  if (shop.logoUrl) {
    images.unshift({
      id: 0,
      url: shop.logoUrl,
      createdAt: shop.createdAt,
      type: "logo",
    });
  }

  res.status(200).json({ images });
});

router.post("/:id/images", upload.single("image"), async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid shop id" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "Missing required file: image" });
    return;
  }

  try {
    const image = await prisma.shopImage.create({
      data: {
        shopId: id,
        url: `/uploads/${req.file.filename}`,
      },
    });
    res.status(201).json(image);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ error: "Shop not found" });
      return;
    }
    res.status(500).json({ error: "Failed to save shop image" });
  }
});

router.post("/:id/images/logo", upload.single("image"), async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid shop id" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "Missing required file: image" });
    return;
  }

  const logoUrl = `/uploads/${req.file.filename}`;

  try {
    const shop = await prisma.shop.update({
      where: { id },
      data: { logoUrl },
      select: { logoUrl: true },
    });
    res.status(200).json({ logoUrl: shop.logoUrl });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ error: "Shop not found" });
      return;
    }
    res.status(500).json({ error: "Failed to update shop logo" });
  }
});

export default router;
