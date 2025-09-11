const { Server } = require("socket.io");

// store connected users
let activeCustomers = {}; // { orderId: socketId }
let activeDrivers = {}; // { driverId: socketId }

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*", // change to your frontend domain in production
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Customer subscribes to updates for their order
    socket.on("joinOrderRoom", ({ orderId, customerId }) => {
      socket.join(`order_${orderId}`);
      activeCustomers[orderId] = socket.id;
      console.log(`Customer ${customerId} joined room order_${orderId}`);
    });

    // Driver sends location directly (alternative to REST)
    socket.on("driverLocation", ({ driverId, orderId, lat, lng }) => {
      activeDrivers[driverId] = socket.id;

      // emit only to this order's customers
      io.to(`order_${orderId}`).emit("locationUpdate", {
        driverId,
        lat,
        lng,
        timestamp: Date.now(),
      });
      console.log(
        `Driver ${driverId} location for order ${orderId}: ${lat}, ${lng}`
      );
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      Object.keys(activeCustomers).forEach((orderId) => {
        if (activeCustomers[orderId] === socket.id)
          delete activeCustomers[orderId];
      });
      Object.keys(activeDrivers).forEach((driverId) => {
        if (activeDrivers[driverId] === socket.id)
          delete activeDrivers[driverId];
      });
    });
  });

  // helper function for controllers
  function sendDriverLocation(orderId, payload) {
    io.to(`order_${orderId}`).emit("locationUpdate", payload);
  }

  return { sendDriverLocation };
}

module.exports = { initSocket };
