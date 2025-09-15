const express = require("express");
const router = express.Router();
const { authJwt } = require("../middlewares");
const chatController = require("../controllers/chat.controller");

// Get chat history
router.get(
  "/history",
  [authJwt.verifyToken, authJwt.checkAgentOrCustomer],
  chatController.getChatHistory
);

module.exports = router;
