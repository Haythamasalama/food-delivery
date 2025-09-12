const db = require("../../db/models");
const Order = db.Order;
const Customer = db.Customer;
const MenuItem = db.MenuItem;
const Restaurant = db.Restaurant;
const RestaurantNotification = db.RestaurantNotification;

const { helpers } = require("../utils/socket");

exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const customer = await Customer.findOne({ where: { userId } });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    const { itemId, quantity, driverId } = req.body;
    const item = await MenuItem.findByPk(itemId, {
      include: { model: Restaurant, as: "restaurant" },
    });
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    const totalPrice = item.price * (quantity || 1);

    const order = await Order.create({
      customerId: customer.customerId,
      itemId,
      quantity,
      driverId,
      totalPrice,
      status: "confirmed",
    });

    const restaurantId = item.restaurant?.restaurantId;

    if (restaurantId) {
      const notification = await RestaurantNotification.create({
        restaurantId,
        orderId: order.orderId,
        status: "pending",
        payload: {
          orderId: order.orderId,
          item: { itemId: item.itemId, name: item.name, price: item.price },
          quantity: order.quantity,
          totalPrice: order.totalPrice,
          customerId: customer.customerId,
          createdAt: order.createdAt,
        },
      });

      // send to staff (if any)
      if (helpers?.sendNewOrderToRestaurant) {
        helpers.sendNewOrderToRestaurant(restaurantId, {
          notificationId: notification.notificationId,
          orderId: order.orderId,
          payload: notification.payload,
        });
      }
    }

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ message: err.message });
  }
};

// Long Polling Order Status
exports.trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const timeout = 30000; // (30)s max hold time for long poll
    const pollInterval = 2000; // (2s) how often to check DB while holding connection

    let lastStatus = null;
    let timer;

    const checkStatus = async () => {
      const order = await Order.findByPk(orderId, { include: [MenuItem] });

      if (!order) {
        clearTimeout(timer);
        return res.status(404).send({ message: "Order not found" });
      }

      // If first run → set baseline status
      if (lastStatus === null) {
        lastStatus = order.status;
      }

      // ✅ If status changed OR delivered → respond immediately
      if (order.status !== lastStatus || order.status === "delivered") {
        clearTimeout(timer);
        return res.status(200).send({ order });
      }

      // Otherwise keep checking until timeout
      setTimeout(checkStatus, pollInterval);
    };

    // Force timeout after 30s → client should reconnect
    timer = setTimeout(() => {
      return res.status(200).send({ message: "No change", status: lastStatus });
    }, timeout);

    checkStatus();
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Update order status (admin or system)
exports.updateStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).send({ message: "Order not found" });

    await order.update({ status });

    res.status(200).send({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
