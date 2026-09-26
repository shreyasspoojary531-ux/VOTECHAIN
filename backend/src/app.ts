import express, { type Application } from "express";
import { globalLimiter } from "./middleware/rateLimiter";
import authRoutes from "./routes/auth.routes";

export function createApp(): Application {
  const app = express();

  app.use(express.json());
  app.use(globalLimiter);

  app.use("/api/v1/auth", authRoutes);

  return app;
}
