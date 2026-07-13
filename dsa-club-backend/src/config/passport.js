import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from './config.js';

if (config.google.clientId && config.google.clientSecret) {
    passport.use(new GoogleStrategy({
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl
    }, (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    }));
}

export default passport;