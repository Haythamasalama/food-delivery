const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const { io } = require("socket.io-client");

// --- CONFIG ---
const SERVER_URL = "http://localhost:3000"; // your backend URL
const MENU_ITEM_ID = 1; // the menu item you want to upload an image for
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsInJvbGUiOiJzdGFmZiIsImlhdCI6MTc1ODAxODUwMCwiZXhwIjoxNzU4NjIzMzAwfQ.IuBuTPNtGBSGrv83FjcdEL-PO3XIa9nSFgDwvTr4m0U"; // staff JWT token for auth
const IMAGE_PATH = path.join(__dirname, "campany-logo.PNG"); // your test image

// --- SOCKET SETUP ---
const socket = io(SERVER_URL, {
  auth: { token: TOKEN },
  reconnection: true,
});

socket.on("connect", () => {
  console.log("Connected to server via Socket.io:", socket.id);

  // Join menu item room to receive progress updates
  socket.emit("joinMenuItemRoom", { itemId: MENU_ITEM_ID });
});

// Listen for progress updates
socket.on("uploadProgress", (data) => {
  console.log("Upload progress:", data.progress + "%");
});

// Listen for completion
socket.on("uploadComplete", (data) => {
  console.log("Upload complete! Image saved at:", data.imageUrl);
});

// Listen for errors
socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
});

// --- UPLOAD IMAGE VIA HTTP ---
async function uploadImage() {
  try {
    const form = new FormData();
    form.append("image", fs.createReadStream(IMAGE_PATH));
    form.append("itemId", MENU_ITEM_ID);

    const response = await axios.post(
      `${SERVER_URL}/api/menu/upload-image`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${TOKEN}`,
        },
        maxContentLength: 20 * 1024 * 1024, // 20MB
        maxBodyLength: 20 * 1024 * 1024,
      }
    );

    console.log("HTTP upload response:", response.data);
  } catch (error) {
    console.error(
      "Error uploading image:",
      error.response?.data || error.message
    );
  }
}

// Start upload after socket connects
socket.on("connect", () => {
  uploadImage();
});
