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

    const { itemId, quantity } = req.body;
    const item = await MenuItem.findByPk(itemId);
    if (!item) return res.status(404).send({ message: "Menu item not found" });

    const totalPrice = item.price * (quantity || 1);

    const order = await Order.create({
      customerId: customer.customerId,
      itemId,
      quantity,
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

    let attempts = 0;
    const interval = 6000; // 6s
    const maxAttempts = 20; // up to 2min
    let lastStatus = null;

    const checkStatus = async () => {
      attempts++;
      const order = await Order.findByPk(orderId, { include: [MenuItem] });

      if (!order) return res.status(404).send({ message: "Order not found" });

      // First iteration → set baseline status
      if (lastStatus === null) {
        lastStatus = order.status;
      }

      // ✅ If status changed OR delivered → return immediately
      if (order.status !== lastStatus || order.status === "delivered") {
        return res.status(200).send({ order });
      }

      // ✅ If max attempts reached → return current status
      if (attempts >= maxAttempts) {
        return res.status(200).send({ order });
      }

      // Keep waiting
      setTimeout(checkStatus, interval);
    };

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
