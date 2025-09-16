const { io } = require("socket.io-client");

// Connect to your server
const socket = io("http://localhost:3000", { reconnection: true });

const customerId = 6; // replace with actual customerId

socket.on("connect", () => {
  console.log("Connected as client:", socket.id);

  // Join customer room to receive payment updates
  socket.emit("joinCustomerRoom", { customerId });
  console.log(`Joined room customer_${customerId}`);
});

// Listen for payment status updates from server
socket.on("paymentUpdate", (data) => {
  console.log("Payment update received:", data);
  console.log(`Order ${data.orderId} payment status: ${data.paymentStatus}`);
});

// Optional: Listen for disconnects
socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
