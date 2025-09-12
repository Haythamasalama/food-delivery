const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../../db/models");
const User = db.User;
const Customer = db.Customer;
const Driver = db.Driver;
const Staff = db.Staff;
const config = require("../../config/auth.config");
const { blacklistToken } = require("../middlewares/authJwt");

exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).send({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      isVerified: true,
    });

    // If role is customer → create row in Customers table
    if (role === "customer") {
      await Customer.create({
        userId: user.userId, // FK
      });
    }

    // If role is driver → create row in Drivers table
    if (role === "driver") {
      await Driver.create({
        userId: user.userId,
        fullName: fullName,
        phone: "",
        vehicleType: "",
        status: "available",
      });
    }

    // If role is driver → create row in Drivers table
    if (role === "staff") {
      await Staff.create({
        userId: user.userId,
        fullName: fullName,
        phone: "",
        restaurantId: 1,
      });
    }

    res.status(201).send({ message: "User registered", user });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.localLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (!user.password) {
      return res
        .status(400)
        .send({ message: "This account uses Google login" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.userId, role: user.role },
      config.secret,
      { expiresIn: "7d" }
    );

    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .send({
        message: "Login successful",
        user,
        accessToken: token,
      });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.googleSuccess = async (req, res) => {
  if (!req.user) return res.status(401).send({ message: "Unauthorized" });

  const token = jwt.sign(
    { id: req.user.userId, role: req.user.role },
    config.secret,
    { expiresIn: "7d" }
  );

  res
    .cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .send({
      message: "Google login successful",
      user: req.user,
      accessToken: token,
    });
};

exports.googleFailure = (req, res) => {
  res.status(401).send({ message: "Google login failed" });
};

exports.logout = (req, res) => {
  let token = req.headers["authorization"];
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(400).send({ message: "No token provided" });
  }

  token = token.split(" ")[1];
  blacklistToken(token);
  return res.status(200).send({ message: "Logged out successfully." });
};
