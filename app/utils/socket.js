const { Server } = require("socket.io");
const db = require("../../db/models");

const helpers = {
  io: null,
  sendDriverLocation: (orderId, payload) => {
    if (helpers.io)
      helpers.io.to(`order_${orderId}`).emit("locationUpdate", payload);
  },
  sendNewOrderToRestaurant: async (restaurantId, payload) => {
    if (!helpers.io) return;

    const room = `restaurant_${restaurantId}`;
    const socketsInRoom = await helpers.io.in(room).fetchSockets();

    if (socketsInRoom.length > 0) {
      console.log(`Emitting new order to restaurant ${restaurantId}`, payload);
      helpers.io.to(room).emit("newOrder", payload);

      // mark as sent after emission
      await db.RestaurantNotification.update(
        { status: "sent", deliveredAt: new Date() },
        { where: { notificationId: payload.notificationId } }
      );
    } else {
      console.log(
        `No staff online for restaurant ${restaurantId}, keep pending`
      );
    }
  },

  // Chat: send message
  sendMessage: async (message) => {
    if (!helpers.io) return;

    const {
      senderId,
      receiverId,
      senderType,
      receiverType,
      message: msg,
    } = message;

    // Save to DB
    const saved = await db.ChatMessage.create({
      senderId,
      receiverId,
      senderType,
      receiverType,
      message: msg,
    });

    // Emit to receiver
    const room = `${receiverType}_${receiverId}`;
    helpers.io.to(room).emit("newMessage", saved);

    // Emit to sender as confirmation
    const senderRoom = `${senderType}_${senderId}`;
    helpers.io.to(senderRoom).emit("messageSent", saved);
  },

  // Chat: typing indicator
  sendTyping: (senderType, senderId, receiverType, receiverId, isTyping) => {
    const room = `${receiverType}_${receiverId}`;
    helpers.io.to(room).emit("typing", { senderType, senderId, isTyping });
  },

  // Chat: mark delivered
  sendDelivered: async (messageId) => {
    await db.ChatMessage.update(
      { deliveredAt: new Date() },
      { where: { messageId } }
    );
  },

  // Chat: mark read
  sendRead: async (messageId) => {
    await db.ChatMessage.update(
      { readAt: new Date() },
      { where: { messageId } }
    );
  },
};

async function initSocket(server) {
  const io = new Server(server, { cors: { origin: "*" } });
  helpers.io = io;

  const activeCustomers = {}; // { orderId: Set(socketId) }
  const activeDrivers = {}; // { driverId: socketId }
  const activeRestaurantStaff = {}; // { restaurantId: Set(socketId) }

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Customer room
    socket.on("joinOrderRoom", ({ orderId, customerId }) => {
      socket.join(`order_${orderId}`);
      activeCustomers[orderId] = activeCustomers[orderId] || new Set();
      activeCustomers[orderId].add(socket.id);
      console.log(`Customer ${customerId} joined room order_${orderId}`);
    });

    // Restaurant staff room
    socket.on("joinRestaurantRoom", async ({ restaurantId, staffId }) => {
      socket.join(`restaurant_${restaurantId}`);
      activeRestaurantStaff[restaurantId] =
        activeRestaurantStaff[restaurantId] || new Set();
      activeRestaurantStaff[restaurantId].add(socket.id);
      console.log(`Staff ${staffId} joined room restaurant_${restaurantId}`);

      try {
        const pending = await db.RestaurantNotification.findAll({
          where: { restaurantId, status: "pending" },
          order: [["notification_id", "ASC"]],
        });

        pending.forEach(async (n) => {
          socket.emit("newOrder", {
            notificationId: n.notificationId,
            orderId: n.orderId,
            payload: n.payload,
          });

          await db.RestaurantNotification.update(
            { status: "sent", deliveredAt: new Date() },
            { where: { notificationId: n.notificationId } }
          );
        });
      } catch (err) {
        console.error("Error fetching pending notifications:", err.message);
      }
    });

    // Driver location
    socket.on("driverLocation", ({ driverId, orderId, lat, lng }) => {
      activeDrivers[driverId] = socket.id;
      io.to(`order_${orderId}`).emit("locationUpdate", {
        driverId,
        lat,
        lng,
        timestamp: Date.now(),
      });
    });

    // Staff acknowledges notification
    socket.on("ackOrder", async ({ notificationId }) => {
      try {
        await db.RestaurantNotification.update(
          { status: "acknowledged", acknowledgedAt: new Date() },
          { where: { notificationId } }
        );
        socket.emit("ackConfirmed", { notificationId });
      } catch (err) {
        console.error("Error acking notification:", err.message);
      }
    });

    /*** Chat Rooms ***/
    // Join chat personal room
    socket.on("joinChat", ({ userId, userType }) => {
      const room = `${userType}_${userId}`;
      socket.join(room);
      console.log(`${userType} ${userId} joined chat room ${room}`);
    });

    // Send chat message
    socket.on("sendMessage", async (data) => {
      await helpers.sendMessage(data);
    });

    // Typing indicator
    socket.on(
      "typing",
      ({ senderType, senderId, receiverType, receiverId, isTyping }) => {
        helpers.sendTyping(
          senderType,
          senderId,
          receiverType,
          receiverId,
          isTyping
        );
      }
    );

    // Mark delivered
    socket.on("delivered", async ({ messageId }) => {
      await helpers.sendDelivered(messageId);
    });

    // Mark read
    socket.on("read", async ({ messageId }) => {
      await helpers.sendRead(messageId);
    });

    // Announcement
    socket.on("joinRoleRoom", ({ userId, role }) => {
      const room = `role_${role}`;
      socket.join(room);
      console.log(`User ${userId} with role ${role} joined room ${room}`);
    });

    // When user reconnects, send pending announcements
    socket.on("fetchAnnouncements", async ({ role }) => {
      try {
        const pending = await db.Announcement.findAll({
          where: {
            [db.Sequelize.Op.or]: [
              db.sequelize.where(
                db.sequelize.fn(
                  "JSON_CONTAINS",
                  db.sequelize.col("audience"),
                  '"all"'
                ),
                true
              ),
              db.sequelize.where(
                db.sequelize.fn(
                  "JSON_CONTAINS",
                  db.sequelize.col("audience"),
                  `"${role}"`
                ),
                true
              ),
            ],
          },
          order: [["createdAt", "DESC"]],
          limit: 10,
        });
        socket.emit("announcementBatch", pending);
      } catch (err) {
        console.error("Error fetching announcements for socket:", err.message);
      }
    });

    // Client joins menu item room to receive upload progress
    socket.on("joinMenuItemRoom", ({ itemId }) => {
      const room = `menuItem_${itemId}`;
      socket.join(room);
      console.log(`Client ${socket.id} joined menu item room ${room}`);
    });

    // Customer joins their own room for notifications
    socket.on("joinCustomerRoom", ({ customerId }) => {
      const room = `customer_${customerId}`;
      socket.join(room);
      console.log(`Customer ${customerId} joined room ${room}`);
    });

    // Disconnect cleanup
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      Object.keys(activeCustomers).forEach((orderId) => {
        activeCustomers[orderId].delete(socket.id);
        if (activeCustomers[orderId].size === 0)
          delete activeCustomers[orderId];
      });
      Object.keys(activeRestaurantStaff).forEach((restaurantId) => {
        activeRestaurantStaff[restaurantId].delete(socket.id);
        if (activeRestaurantStaff[restaurantId].size === 0)
          delete activeRestaurantStaff[restaurantId];
      });
      Object.keys(activeDrivers).forEach((driverId) => {
        if (activeDrivers[driverId] === socket.id)
          delete activeDrivers[driverId];
      });
    });
  });

  return helpers;
}

module.exports = { initSocket, helpers };
