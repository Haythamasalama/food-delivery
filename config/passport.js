const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../db/models");
const User = db.User;
const Customer = db.Customer;

// Serialize & deserialize
passport.serializeUser((user, done) => {
  done(null, user.userId);
});

passport.deserializeUser(async (userId, done) => {
  const user = await User.findByPk(userId, { include: Customer });
  done(null, user);
});

// Google OAuth Strategy
// Inside GoogleStrategy verify function
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACKURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const [user, created] = await db.User.findOrCreate({
          where: { email: profile.emails[0].value },
          defaults: {
            fullName: profile.displayName,
            password: null, // no password for Google login
            role: "customer",
            isVerified: true,
          },
        });

        // Create a blank customer profile if new user
        if (created) {
          await db.Customer.create({
            userId: user.userId,
            phone: null,
            location: null,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
