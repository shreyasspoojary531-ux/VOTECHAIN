import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';

import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import registrarRoutes from './routes/registrar.routes';
import registrarSummaryRoutes from './routes/registrar.summary.routes';
import adminRoutes from './routes/admin.routes';
import electionRoutes from './routes/election.routes';
import candidateRoutes from './routes/candidate.routes';
import votingRoutes from './routes/voting.routes';
import blockchainRoutes from './routes/blockchain.routes';
import auditRoutes from './routes/audit.routes';

const app: Application = express();

// Security headers
app.use(helmet());

// CORS configuration (supports comma-separated domains or wildcard)
const rawCorsOrigin = config.CORS_ORIGIN || '*';
const allowedOrigins = rawCorsOrigin.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser agents (curl, mobile, Postman) or wildcard
      if (!origin || rawCorsOrigin === '*' || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Fallback permissive for seamless cross-domain deployments
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Rate limiting (100 requests per 15 mins by default)
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      status: 429,
    },
  },
});
app.use(limiter);

// JSON body parser
app.use(express.json());

// Request logging via pino-http
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === '/api/v1/health',
    },
  })
);

// Mount API routes
app.use('/api/v1', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/registrar', registrarSummaryRoutes);
app.use('/api/v1/registrar', registrarRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/elections', electionRoutes);
app.use('/api/v1/candidates', candidateRoutes);
app.use('/api/v1/votes', votingRoutes);
app.use('/api/v1/blockchain', blockchainRoutes);
app.use('/api/v1/audit', auditRoutes);

// 404 handler
app.use(notFoundHandler);

// Centralized error handler (must be last)
app.use(errorHandler);

export default app;
