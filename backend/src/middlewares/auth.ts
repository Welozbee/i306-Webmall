import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../../generated/prisma/client";

function getJwtSecret(res: Response): string | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: "JWT secret not configured" });
    return null;
  }
  return secret;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.slice("Bearer ".length);
  const secret = getJwtSecret(res);
  if (!secret) return;

  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload === "string" || !payload.sub) {
      res.status(401).json({ error: "Invalid token payload" });
      return;
    }

    const userId = Number(payload.sub);
    if (!Number.isFinite(userId)) {
      res.status(401).json({ error: "Invalid token subject" });
      return;
    }

    const role = payload.role;
    if (!role || !Object.values(Role).includes(role as Role)) {
      res.status(401).json({ error: "Invalid token role" });
      return;
    }

    const email = typeof payload.email === "string" ? payload.email : "";
    req.user = { id: userId, role: role as Role, email };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient role" });
      return;
    }

    next();
  };
}
