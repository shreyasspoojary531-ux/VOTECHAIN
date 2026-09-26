"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const server = app_1.default.listen(config_1.config.PORT, () => {
    logger_1.logger.info({
        port: config_1.config.PORT,
        env: config_1.config.NODE_ENV,
    }, `🚀 VoteChain Backend service running on port ${config_1.config.PORT}`);
});
// Graceful shutdown handling
const gracefulShutdown = (signal) => {
    logger_1.logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
        logger_1.logger.info('HTTP server closed.');
        process.exit(0);
    });
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
