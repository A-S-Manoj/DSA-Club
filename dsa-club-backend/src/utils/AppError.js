class AppError extends Error {
    constructor(statusCode, code, message, data = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.data = data;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;