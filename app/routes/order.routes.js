const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { authJwt } = require("../middlewares");

// Customer places order
router.post(
  "/",
  [authJwt.verifyToken, authJwt.checkCustomer],
  orderController.placeOrder
);

// Customer long polling for status
router.get(
  "/:orderId/status",
  [authJwt.verifyToken, authJwt.checkCustomer],
  orderController.trackOrder
);

// Admin updates status
router.put(
  "/:orderId/status",
  [authJwt.verifyToken, authJwt.checkAdmin],
  orderController.updateStatus
);

module.exports = router;
