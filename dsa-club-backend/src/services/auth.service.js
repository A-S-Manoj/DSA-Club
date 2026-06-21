import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.model.js';
import AppError from '../utils/AppError.js';
import config from '../config/config.js';
import logger from '../utils/logger.js';

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

const signToken = (id) => {
    return jwt.sign({ id }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
    });
};

const setTokenCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: config.server.isProd,
        sameSite: config.server.isProd ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
    });
};

export const register = async (res, { name, email, password }) => {
    const existing = await User.findOne({ email });
    if (existing) {
        throw new AppError(409, 'AUTH_EMAIL_EXISTS', 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
        name,
        email,
        passwordHash,
        authProvider: 'local'
    });

    const token = signToken(user._id);
    setTokenCookie(res, token);

    return {
        _id: user._id,
        name: user.name,
        email: user.email
    };
};

export const login = async (res, { email, password }) => {
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
        throw new AppError(401, 'AUTH_INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new AppError(401, 'AUTH_INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const token = signToken(user._id);
    setTokenCookie(res, token);

    return {
        _id: user._id,
        name: user.name,
        email: user.email
    };
};

export const logout = (res) => {
    res.clearCookie('token');
};

export const getProfile = async (userId) => {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
        throw new AppError(404, 'AUTH_FORBIDDEN', 'User not found');
    }
    return user;
};

export const updateProfile = async (userId, { name }) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { name },
        { new: true, runValidators: true }
    ).select('-passwordHash');
    return user;
};

export const handleOAuthUser = async (res, { name, email, authProviderId }) => {
    let user = await User.findOne({ email });

    if (!user) {
        user = await User.create({
            name,
            email,
            authProvider: 'google',
            authProviderId
        });
    } else if (!user.authProviderId) {
        user.authProviderId = authProviderId;
        user.authProvider = 'google';
        await user.save();
    }

    const token = signToken(user._id);
    setTokenCookie(res, token);
    return user;
};

export const forgotPassword = async (email) => {
    const user = await User.findOne({ email });
    // always return success — prevent user enumeration
    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = hashToken(resetToken);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const resetUrl = `${config.client.url}/reset-password?token=${resetToken}`;

    try {
        const transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            secure: false,
            auth: {
                user: config.email.user,
                pass: config.email.pass
            }
        });

        await transporter.sendMail({
            from: `DSA Club <${config.email.user}>`,
            to: email,
            subject: 'Password Reset — DSA Club',
            html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password. 
           This link expires in 15 minutes.</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you did not request this, ignore this email.</p>
      `
        });
    } catch (err) {
        logger.error({ message: 'Failed to send reset email', error: err.message });
        await User.findByIdAndUpdate(user._id, {
            $unset: {
                passwordResetToken: 1,
                passwordResetExpires: 1
            }
        });
        // do NOT throw — return silently to prevent enumeration
    }
};

export const resetPassword = async ({ token, newPassword }) => {
    const hashedToken = hashToken(token);
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new AppError(400, 'AUTH_TOKEN_INVALID', 'Reset token is invalid or expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = passwordHash;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
};