import express, { type Application } from "express";
import { securityMiddleware } from "./middleware/security";
import { globalLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import registrarRoutes from "./routes/registrar.routes";
import electionRoutes from "./routes/election.routes";
import voteRoutes from "./routes/vote.routes";
import blockchainRoutes from "./routes/blockchain.routes";
import auditRoutes from "./routes/audit.routes";

export function createApp(): Application {
  const app = express();

  app.use(securityMiddleware);
  app.use(express.json());
  app.use(globalLimiter);

  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  const api = express.Router();
  api.use("/auth", authRoutes);
  api.use("/registrar", registrarRoutes);
  api.use("/elections", electionRoutes);
  api.use("/votes", voteRoutes);
  api.use("/blockchain", blockchainRoutes);
  api.use("/audit", auditRoutes);

  app.use("/api/v1", api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
