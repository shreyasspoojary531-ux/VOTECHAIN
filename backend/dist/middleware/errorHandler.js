"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
const logger_1 = require("../utils/logger");
const config_1 = require("../config");
class AppError extends Error {
    statusCode;
    isOperational;
    code;
    constructor(message, statusCode = 500, isOperational = true, code) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
function errorHandler(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const errorCode = err instanceof AppError ? err.code : 'INTERNAL_SERVER_ERROR';
    logger_1.logger.error({
        err,
        method: req.method,
        url: req.url,
        statusCode,
    }, err.message);
    res.status(statusCode).json({
        error: {
            message: err.message || 'Internal Server Error',
            code: errorCode,
            status: statusCode,
            ...(config_1.config.NODE_ENV !== 'production' && { stack: err.stack }),
        },
    });
}
