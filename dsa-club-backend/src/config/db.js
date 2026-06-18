import mongoose from 'mongoose';
import dns from 'dns';
import config from './config.js';
import logger from '../utils/logger.js';

if (dns.getServers().includes('127.0.0.1')) {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
}

const connectDB = async () => {
    try {
        await mongoose.connect(config.db.uri);
        logger.info('MongoDB connected');
    } catch (err) {
        logger.error({ message: 'MongoDB connection failed', error: err.message });
        process.exit(1);
    }
};

export default connectDB;