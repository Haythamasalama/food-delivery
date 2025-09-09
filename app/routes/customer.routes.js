const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");
const { authJwt } = require("../middlewares");
const completeProfileSchema = require("../validation/completeProfileSchema");
const validate = require("../middlewares/validate");

// Customer completes profile
router.put(
  "/complete-profile",
  [authJwt.verifyToken, validate(completeProfileSchema)],
  customerController.completeProfile
);

module.exports = router;
