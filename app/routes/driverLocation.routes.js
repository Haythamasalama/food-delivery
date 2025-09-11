const express = require("express");
const router = express.Router();
const driverLocationController = require("../controllers/driverLocation.controller");
const { authJwt } = require("../middlewares");

// Update location + emit WebSocket
router.post(
  "/update",
  [authJwt.verifyToken, authJwt.checkDriver],
  driverLocationController.updateLocation
);

module.exports = router;
