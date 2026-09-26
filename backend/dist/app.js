"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const pino_http_1 = __importDefault(require("pino-http"));
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const registrar_routes_1 = __importDefault(require("./routes/registrar.routes"));
const registrar_summary_routes_1 = __importDefault(require("./routes/registrar.summary.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const election_routes_1 = __importDefault(require("./routes/election.routes"));
const candidate_routes_1 = __importDefault(require("./routes/candidate.routes"));
const voting_routes_1 = __importDefault(require("./routes/voting.routes"));
const blockchain_routes_1 = __importDefault(require("./routes/blockchain.routes"));
const audit_routes_1 = __importDefault(require("./routes/audit.routes"));
const app = (0, express_1.default)();
// Security headers
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: config_1.config.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
// Rate limiting (100 requests per 15 mins by default)
const limiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.RATE_LIMIT_WINDOW_MS,
    max: config_1.config.RATE_LIMIT_MAX,
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
app.use(express_1.default.json());
// Request logging via pino-http
app.use((0, pino_http_1.default)({
    logger: logger_1.logger,
    autoLogging: {
        ignore: (req) => req.url === '/api/v1/health',
    },
}));
// Mount API routes
app.use('/api/v1', health_routes_1.default);
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/registrar', registrar_summary_routes_1.default);
app.use('/api/v1/registrar', registrar_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
app.use('/api/v1/elections', election_routes_1.default);
app.use('/api/v1/candidates', candidate_routes_1.default);
app.use('/api/v1/votes', voting_routes_1.default);
app.use('/api/v1/blockchain', blockchain_routes_1.default);
app.use('/api/v1/audit', audit_routes_1.default);
// 404 handler
app.use(notFound_1.notFoundHandler);
// Centralized error handler (must be last)
app.use(errorHandler_1.errorHandler);
exports.default = app;
