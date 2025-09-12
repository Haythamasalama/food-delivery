const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staff.controller");
const { authJwt } = require("../middlewares");
const validate = require("../middlewares/validate");
const completeStaffProfileSchema = require("../validation/completeStaffProfileSchema");

router.put(
  "/complete-profile",
  [
    authJwt.verifyToken,
    authJwt.checkStaff,
    validate(completeStaffProfileSchema),
  ],
  staffController.completeProfile
);

router.get(
  "/",
  [authJwt.verifyToken, authJwt.checkStaff],
  staffController.getProfile
);

module.exports = router;
