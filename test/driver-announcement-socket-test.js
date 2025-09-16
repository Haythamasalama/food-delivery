// test/announcement-socket-test.js
const { io } = require("socket.io-client");

// Connect to server
const socket = io("http://localhost:3000", {
  reconnection: true,
});

socket.on("connect", () => {
  console.log("Connected as announcement client:", socket.id);

  // Join role room (example: driver)
  socket.emit("joinRoleRoom", { userId: 12, role: "driver" });

  // Optionally request missed announcements
  socket.emit("fetchAnnouncements", { role: "driver" });
});

// Listen for live announcements
socket.on("announcement", (data) => {
  console.log("🔔 Live announcement received:", data);
});

// Listen for batch announcements (on reconnect or fetch)
socket.on("announcementBatch", (data) => {
  console.log("📦 Batch announcements received:", data);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
