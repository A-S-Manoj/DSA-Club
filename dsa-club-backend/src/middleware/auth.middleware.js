import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/User.model.js';

const protect = catchAsync(async (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        throw new AppError(401, 'AUTH_TOKEN_MISSING', 'No token provided');
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
        throw new AppError(401, 'AUTH_TOKEN_INVALID', 'User no longer exists');
    }

    req.user = user;
    next();
});

export default protect;