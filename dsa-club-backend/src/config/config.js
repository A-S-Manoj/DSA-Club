import dotenv from 'dotenv';
dotenv.config();

const config = {
    server: {
        port: process.env.PORT || 5000,
        nodeEnv: process.env.NODE_ENV || 'development',
        isDev: process.env.NODE_ENV === 'development',
        isProd: process.env.NODE_ENV === 'production'
    },
    db: {
        uri: process.env.MONGODB_URI
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    },
    azure: {
        speechKey: process.env.AZURE_SPEECH_KEY,
        speechRegion: process.env.AZURE_SPEECH_REGION
    },
    email: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
        maxAuth: parseInt(process.env.RATE_LIMIT_MAX_AUTH) || 5,
        maxMessage: parseInt(process.env.RATE_LIMIT_MAX_MESSAGE) || 30,
        maxImport: parseInt(process.env.RATE_LIMIT_MAX_IMPORT) || 10,
        maxGeneral: parseInt(process.env.RATE_LIMIT_MAX_GENERAL) || 60
    },
    client: {
        url: process.env.CLIENT_URL
    }
};

const required = [
    ['db.uri', config.db.uri],
    ['jwt.secret', config.jwt.secret],
    ['client.url', config.client.url]
];

required.forEach(([key, val]) => {
    if (!val) {
        console.error(`Missing required env variable: ${key}`);
        process.exit(1);
    }
});

export default config;