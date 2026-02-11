import express from "express";
import cors from "cors";
import logger from "./middlewares/logger";
import prisma from "./prisma";
import authRouter from "./routes/auth";
import shopImagesRouter from "./routes/shop-images";
import shopRouter from "./routes/shop";
import gameRouter from "./routes/game";
import parkingRouter from "./routes/parking";
import visitorsRouter from "./routes/visitors";
import usersRouter from "./routes/users";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(logger);

// health check endpoint
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", db: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", db: "error" });
  }
});

app.use("/auth", authRouter);
app.use("/shop", shopRouter);
app.use("/shop", shopImagesRouter);
app.use("/game", gameRouter);
app.use("/parking", parkingRouter);
app.use("/visitors", visitorsRouter);
app.use("/users", usersRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
