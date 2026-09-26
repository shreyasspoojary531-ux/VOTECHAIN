import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface Config {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  LOG_LEVEL: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
}

function validateEnv(): Config {
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `[FATAL] Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  const nodeEnv = (process.env.NODE_ENV || 'development') as Config['NODE_ENV'];

  return {
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: nodeEnv,
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per 15 min
  };
}

export const config = validateEnv();
