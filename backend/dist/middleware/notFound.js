"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
const errorHandler_1 = require("./errorHandler");
function notFoundHandler(req, _res, next) {
    next(new errorHandler_1.AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, true, 'NOT_FOUND'));
}
