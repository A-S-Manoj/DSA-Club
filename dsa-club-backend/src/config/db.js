import mongoose from 'mongoose';
import dns from 'dns';
import config from './config.js';
import logger from '../utils/logger.js';

if (dns.getServers().includes('127.0.0.1')) {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
}

const connectDB = async () => {
    try {
        await mongoose.connect(config.db.uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10
        });
        logger.info('MongoDB connected');
    } catch (err) {
        logger.error({ message: 'MongoDB connection failed', error: err.message });
        process.exit(1);
    }
};

// handle connection events
mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
});

export default connectDB;