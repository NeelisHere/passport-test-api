const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const UserModel = require('../models/UserModel')

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.GOOGLE_LOCAL_API_URL}/auth/google/callback`,
        passReqToCallback: true
    },
    async (request, accessToken, refreshToken, profile, done) => {
        const { sub, name, email } = profile._json
        console.log('verify-user callback')
        let user = await UserModel.findOne({ googleId: sub })
        if (!user) {
            user = await UserModel.create({ googleId: sub, username: name, email })
        }
        return done(null, user);
    }
));

passport.serializeUser((user, done) => {
    console.log('serialize')
    done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
    console.log('--deserialize')
    try {
        const user = await UserModel.findById(id)
        // console.log(user)
        done(null, user)
    } catch (error) {
        console.log(error)
    }
})