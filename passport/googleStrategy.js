const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const UserModel = require('../models/UserModel')

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_LOCAL_CALLBACK_URL,
        passReqToCallback: true
    },
    async (request, accessToken, refreshToken, profile, done) => {
        const { sub, name, email, picture } = profile._json
        // console.log(user)
        let user = await UserModel.findOne({ googleId: sub })
        if (!user) {
            user = await UserModel.create({
                googleId: sub,
                username: name,
                email,
                picture
            })
        }
        return done(null, user);
    }
));

passport.serializeUser((user, done) => {
    // console.log(user)
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});