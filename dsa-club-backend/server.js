import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import config from './src/config/config.js';
import connectDB from './src/config/db.js';
import errorHandler from './src/middleware/errorHandler.middleware.js';
import logger from './src/utils/logger.js';
import './src/models/User.model.js';
import './src/models/Problem.model.js';
import './src/models/Session.model.js';
import passport from './src/config/passport.js';
import authRoutes from './src/routes/auth.routes.js';
const app = express();

// connect database
connectDB();

// middleware
app.use(cors({
    origin: config.client.url,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan(config.server.isDev ? 'dev' : 'combined'));

// health check
app.get('/health', (req, res) => {
    res.json({ success: true, data: { status: 'ok' } });
});

// routes
app.use(passport.initialize());
app.use('/api/v1/auth', authRoutes);

// error handler
app.use(errorHandler);

app.listen(config.server.port, () => {
    logger.info(`Server running on port ${config.server.port} in ${config.server.nodeEnv} mode`);
});

export default app;