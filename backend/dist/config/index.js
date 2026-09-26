"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env file
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
function validateEnv() {
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`[FATAL] Missing required environment variables: ${missingVars.join(', ')}`);
    }
    const nodeEnv = (process.env.NODE_ENV || 'development');
    return {
        PORT: parseInt(process.env.PORT || '5000', 10),
        NODE_ENV: nodeEnv,
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
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
exports.config = validateEnv();
