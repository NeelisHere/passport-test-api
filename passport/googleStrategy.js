const passport = require('passport')
const logger = require('../logger');
const UserModel = require('../models/UserModel')
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
// const logger = require('../logger')
// const passportJWT = require("passport-jwt");
// const JWTStrategy = passportJWT.Strategy;
// const ExtractJWT = passportJWT.ExtractJwt;

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.GOOGLE_LOCAL_API_URL}/auth/google/callback`,
        passReqToCallback: true
    },
    async (request, accessToken, refreshToken, profile, done) => {
        const { sub, name, email, picture } = profile._json
        console.log('verify-user callback')
        let user = await UserModel.findOne({ googleId: sub })
        if (!user) {
            user = await UserModel.create({ googleId: sub, username: name, email, picture })
        }
        return done(null, user);
    }
));

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {
        console.info('inside verify user callback')
        const user = await UserModel.findOne({ email }).select('-picture')
        console.log(user)
        if (!user) {
            done(null, false);
        } else {
            done(null, user)
        }
    }
));

passport.serializeUser((user, done) => {
    console.log('serialize', user)
    done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
    console.log('--deserialize')
    try {
        const user = await UserModel.findById(id).select('-picture')
        console.log(id, user)
        done(null, user)
    } catch (error) {
        console.log(error)
    }
})