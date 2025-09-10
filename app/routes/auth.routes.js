const express = require("express");
const router = express.Router();
const passport = require("../../config/passport");
const authController = require("../controllers/auth.controller");
const { authJwt } = require("../middlewares");
const {
  validateSignup,
  validateLogin,
} = require("../validation/auth.validation");

// signup
router.post("/signup", validateSignup, authController.signup);

// Local login
router.post("/login", validateLogin, authController.localLogin);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/auth/failure" }),
  authController.googleSuccess
);

router.get("/failure", authController.googleFailure);

router.post("/logout", [authJwt.verifyToken], authController.logout);

module.exports = router;
