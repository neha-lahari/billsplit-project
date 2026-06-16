const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// google login strategy 
passport.use(
    "google-login",
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5000/api/auth/google/login/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }
    )
);

//google register strategy
passport.use(
    "google-register",
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5000/api/auth/google/register/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;