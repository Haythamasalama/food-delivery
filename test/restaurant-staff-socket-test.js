// test/restaurant-staff-socket-test.js
const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
  reconnection: true,
});

socket.on("connect", () => {
  console.log("Connected as staff client:", socket.id);

  // join restaurant room
  socket.emit("joinRestaurantRoom", { restaurantId: 1, staffId: 1 });
});

// Listen for incoming new orders
socket.on("newOrder", (data) => {
  console.log("New order notification:", data);

  // ack the notification
  if (data && data.notificationId) {
    socket.emit("ackOrder", {
      notificationId: data.notificationId,
      staffId: 1,
    });
  }
});

socket.on("ackConfirmed", (data) => {
  console.log("Server confirmed ack:", data);
});
