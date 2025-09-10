const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driver.controller");
const { authJwt } = require("../middlewares");
const validate = require("../middlewares/validate");
const completeDriverProfileSchema = require("../validation/completeDriverProfileSchema");

router.put(
  "/complete-profile",
  [
    authJwt.verifyToken,
    authJwt.checkDriver,
    validate(completeDriverProfileSchema),
  ],
  driverController.completeProfile
);

router.get(
  "/",
  [authJwt.verifyToken, authJwt.checkDriver],
  driverController.getProfile
);

router.get(
  "/all",
  [authJwt.verifyToken, authJwt.checkAdminOrDriverOrCustomer],
  driverController.getAllDrivers
);

router.patch(
  "/:driverId/status",
  [authJwt.verifyToken, authJwt.checkAdminOrDriver],
  driverController.updateDriverStatus
);

module.exports = router;
