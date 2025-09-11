const db = require("../../db/models");
const DriverLocation = db.DriverLocation;
const Driver = db.Driver;
const Order = db.Order;

let socketHelpers;

// Inject socket helpers from socket.js
function setSocket(ioHelpers) {
  socketHelpers = ioHelpers;
}

// REST → WebSocket bridge: driver updates location
exports.updateLocation = async (req, res) => {
  try {
    const { orderId, lat, lng } = req.body;
    const userId = req.user.userId;

    const driver = await Driver.findOne({ where: { userId } });

    if (!driver) return res.status(404).send({ message: "Driver not found" });

    const driverId = driver.driverId;

    // Check if order is active for delivery
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    if (order.status !== "picked_up") {
      return res.status(400).send({ message: "Order not active for delivery" });
    }

    let location = await DriverLocation.findOne({ where: { driverId } });
    if (location) {
      await location.update({ latitude: lat, longitude: lng });
    } else {
      location = await DriverLocation.create({
        driverId,
        latitude: lat,
        longitude: lng,
      });
    }

    // broadcast only to customers of this order
    if (socketHelpers) {
      socketHelpers.sendDriverLocation(orderId, {
        driverId,
        lat,
        lng,
        timestamp: Date.now(),
      });
    }

    res.status(200).send({
      message: "Location updated successfully",
      driverId,
      orderId,
      lat,
      lng,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports.setSocket = setSocket;
