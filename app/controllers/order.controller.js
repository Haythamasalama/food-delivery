const db = require("../../db/models");
const Order = db.Order;
const Customer = db.Customer;
const MenuItem = db.MenuItem;

// Place new order
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.userId; // from JWT
    const customer = await Customer.findOne({ where: { userId } });
    if (!customer)
      return res.status(404).send({ message: "Customer not found" });

    const { itemId, quantity, driverId } = req.body;
    const item = await MenuItem.findByPk(itemId);
    if (!item) return res.status(404).send({ message: "Menu item not found" });

    const totalPrice = item.price * (quantity || 1);

    const order = await Order.create({
      customerId: customer.customerId,
      itemId,
      quantity,
      driverId,
      totalPrice,
      status: "confirmed",
    });

    res.status(201).send({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).send({ message: error.message });
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
