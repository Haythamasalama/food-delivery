const { io } = require("socket.io-client");

const socket = io("http://localhost:3000"); // Connect to your server

socket.on("connect", () => {
  console.log("Connected as client:", socket.id);

  // Join order room (simulate customer)
  socket.emit("joinOrderRoom", { orderId: 4, customerId: 6 });
});

// Listen for location updates from server
socket.on("locationUpdate", (data) => {
  console.log("Location update received:", data);
});
