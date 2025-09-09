const jwt = require("jsonwebtoken");
const config = require("../../config/auth.config");
const { blacklistToken } = require("../middlewares/authJwt");

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
