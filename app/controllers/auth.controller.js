const db = require("../../db/models");
const config = require("../../config/auth.config");
const User = db.User;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { blacklistToken } = require("../middlewares/authJwt");
const Errors = require("../utils/customErrors");
const { sendEmail } = require("../utils/emailSender");

// Signup Controller
exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send({ message: "User already registered" });
    }
    
    const user = await User.create({
      fullName,
      email,
      password: bcrypt.hashSync(password, 10),
      phone,
      role,
      isVerified: false,
    });

    res.status(201).send({
      message: `User registered successfully with email: ${user.email} !`,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).send({ message: `User ${email} Not found!` });
    }

    if (!user.isVerified) {
      return res.status(403).send({ message: "Account not verified!" });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res
        .status(401)
        .send({ accessToken: null, message: "Invalid Password!" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.userId }, config.secret, {
      expiresIn: rememberMe ? "30d" : "1d", // Optional: use '30d' and '1d' format
    });

    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development",
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 30 days or 1 day
      })
      .status(200)
      .send({
        id: user.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        accessToken: token,
      });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

exports.logout = (req, res) => {
  let token = req.headers["authorization"];

  if (!token || !token.startsWith("Bearer ")) {
    return res
      .status(400)
      .send({ message: "No token provided or invalid format!" });
  }

  token = token.split(" ")[1];
  blacklistToken(token);

  return res.status(200).send({ message: "Logged out successfully." });
};

exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      const error = Errors.NotFoundError("User", userId);
      return res.status(error.status).send({ message: error.message });
    }

    if (user.verificationCode !== code) {
      return res.status(400).send({ message: "Invalid code" });
    }
    if (Date.now() > user.verificationCodeExpires.getTime()) {
      return res.status(400).send({ message: "Code expired" });
    }

    await user.update({
      isVerified: true,
      verificationCode: null,
      verificationCodeExpires: null,
    });

    res.status(200).send({ message: "Account verified successfully!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.requestResetCode = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = Errors.NotFoundError("User", email);
      return res.status(error.status).send({ message: error.message });
    }

    const resetCode = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 10 * 60000); // 10 minutes

    await user.update({
      verificationCode: resetCode,
      verificationCodeExpires: expires,
    });

    await sendEmail(
      user.email,
      "Your Password Reset Code",
      `Your Password Reset Code code is: ${resetCode}`
    );

    res.status(200).send({ message: "Reset code sent to your email" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = Errors.NotFoundError("User", email);
      return res.status(error.status).send({ message: error.message });
    }

    if (user.verificationCode !== code) {
      return res.status(400).send({ message: "Invalid reset code" });
    }

    if (Date.now() > new Date(user.verificationCodeExpires)) {
      return res.status(400).send({ message: "Reset code expired" });
    }

    await user.update({
      password: bcrypt.hashSync(newPassword, 10),
      verificationCode: null,
      verificationCodeExpires: null,
    });

    res.status(200).send({ message: "Password has been reset successfully!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
