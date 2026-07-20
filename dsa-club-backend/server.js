import 'newrelic';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import config from './src/config/config.js';
import connectDB from './src/config/db.js';
import errorHandler from './src/middleware/errorHandler.middleware.js';
import logger from './src/utils/logger.js';
import passport from './src/config/passport.js';

// routes
import authRoutes from './src/routes/auth.routes.js';
import problemRoutes from './src/routes/problem.routes.js';
import sessionRoutes from './src/routes/session.routes.js';
import dashboardRoutes from './src/routes/dashboard.routes.js';
import configRoutes from './src/routes/config.routes.js';

// models
import './src/models/User.model.js';
import './src/models/Problem.model.js';
import './src/models/Session.model.js';

const app = express();

// connect database
connectDB();

// security headers
app.use(helmet());

// cors
app.use(cors({
    origin: config.client.url,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// body parsing with size limit
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(morgan(config.server.isDev ? 'dev' : 'combined'));
app.use(passport.initialize());

// health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'ok',
            uptime: process.uptime(),
            environment: config.server.nodeEnv,
            timestamp: new Date().toISOString()
        }
    });
});

// api routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/problems', problemRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/config', configRoutes);

// error handler — must be last
app.use(errorHandler);

// start server
const server = app.listen(config.server.port, () => {
    logger.info(
        `Server running on port ${config.server.port} in ${config.server.nodeEnv} mode`
    );
});

// graceful shutdown
const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
    // force exit after 10 seconds if graceful shutdown fails
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;