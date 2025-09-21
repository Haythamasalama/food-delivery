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

// Google OAuth Strategy (optional)
// Only configure if Google OAuth credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
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
} else {
  console.log('Google OAuth not configured - skipping Google Strategy setup');
}

module.exports = passport;
