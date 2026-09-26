import helmet from "helmet";
import cors from "cors";
import { config } from "../config";

export const securityMiddleware = [helmet(), cors({ origin: config.corsOrigin })];
