import express from "express";
import { Role } from "../../generated/prisma/client";
import prisma from "../prisma";
import { authenticate, authorize } from "../middlewares/auth";

const router = express.Router();

// GET /users — list all users (ADMIN only)
router.get("/", authenticate, authorize(Role.ADMIN), async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// PUT /users/:id/role — update a user's role (ADMIN only)
router.put("/:id/role", authenticate, authorize(Role.ADMIN), async (req, res) => {
  const id = Number(req.params.id);
  const { role } = req.body ?? {};

  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  if (!role || !Object.values(Role).includes(role as Role)) {
    res.status(400).json({ error: "Invalid role. Must be USER, EMPLOYEE, or ADMIN" });
    return;
  }

  // Prevent admin from demoting themselves
  if (req.user && req.user.id === id) {
    res.status(400).json({ error: "Vous ne pouvez pas modifier votre propre rôle" });
    return;
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { role: role as Role },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update user role" });
  }
});

export default router;
