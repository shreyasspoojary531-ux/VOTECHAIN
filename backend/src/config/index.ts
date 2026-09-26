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
  JWT_EXPIRES_IN: string;
  OTP_PEPPER: string;
  OTP_EXPIRY_MINUTES: number;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
  FABRIC_CHANNEL: string;
  FABRIC_CHAINCODE: string;
  FABRIC_NETWORK: string;
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
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    OTP_PEPPER: process.env.OTP_PEPPER || 'dev-only-pepper-change-me',
    OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10),
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per 15 min
    FABRIC_CHANNEL: process.env.FABRIC_CHANNEL || 'votechannel',
    FABRIC_CHAINCODE: process.env.FABRIC_CHAINCODE || 'votechain',
    FABRIC_NETWORK: process.env.FABRIC_NETWORK || './blockchain/network',
  };
}

export const config = validateEnv();
