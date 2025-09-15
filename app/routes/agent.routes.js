const express = require("express");
const router = express.Router();
const agentController = require("../controllers/agent.controller");
const { authJwt } = require("../middlewares");
const validate = require("../middlewares/validate");
const completeStaffProfileSchema = require("../validation/completeStaffProfileSchema");

router.put(
  "/complete-profile",
  [
    authJwt.verifyToken,
    authJwt.checkAgent,
    validate(completeStaffProfileSchema),
  ],
  agentController.completeProfile
);

router.get(
  "/",
  [authJwt.verifyToken, authJwt.checkAgent],
  agentController.getProfile
);

module.exports = router;
