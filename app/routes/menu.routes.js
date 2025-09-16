const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menu.controller");
const { authJwt } = require("../middlewares");

// Admin adds new item
router.post(
  "/",
  [authJwt.verifyToken, authJwt.checkStaff],
  menuController.addMenuItem
);

// Get all menu items
router.get("/", menuController.getMenu);

// Upload menu image
router.post(
  "/upload-image",
  [authJwt.verifyToken, authJwt.checkStaff],
  menuController.uploadMenuItemImage
);

module.exports = router;
