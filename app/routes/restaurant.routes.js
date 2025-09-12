const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurant.controller");
const { authJwt } = require("../middlewares");

// create restaurant (admin)
router.post(
  "/",
  [authJwt.verifyToken, authJwt.checkAdmin],
  restaurantController.createRestaurant
);

// list restaurants (public)
router.get("/", restaurantController.getRestaurants);

// get pending notifications (restaurant staff protected ideally)
router.get(
  "/:restaurantId/notifications/pending",
  [authJwt.verifyToken, authJwt.checkStaff],
  restaurantController.getPendingNotifications
);

module.exports = router;
