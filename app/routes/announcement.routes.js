const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcement.controller");
const { authJwt } = require("../middlewares");

router.post(
  "/",
  [authJwt.verifyToken, authJwt.checkAdmin],
  announcementController.createAnnouncement
);
router.get("/", [authJwt.verifyToken], announcementController.getAnnouncements);

module.exports = router;
