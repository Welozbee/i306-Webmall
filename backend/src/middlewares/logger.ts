import type { RequestHandler } from "express";

const logger: RequestHandler = (req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`;
    console.log(message);
  });

  next();
};

export default logger;
