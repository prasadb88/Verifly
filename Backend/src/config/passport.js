import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log("Google Strategy Profile:", JSON.stringify(profile, null, 2));
            try {
                let user = await User.findOne({ email: profile.emails[0].value });
                if (user) {
                    user.googleId = profile.id;
                    user.isGoogleUser = true;
                    user.profileImage = profile.photos?.[0]?.value || profile._json?.picture || user.profileImage;
                    await user.save();
                    return done(null, user);
                }

                const newUser = new User({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    profileImage: profile.photos?.[0]?.value || profile._json?.picture,
                    isGoogleUser: true,
                    username: profile.emails[0].value.split('@')[0] + Math.random().toString(36).substr(2, 5),
                    name: profile.displayName || profile.emails[0].value.split('@')[0],
                    role: "buyer"
                });
                await newUser.save();
                return done(null, newUser);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});
