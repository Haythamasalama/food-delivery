const { io } = require("socket.io-client");
const readline = require("readline");

const CUSTOMER_ID = 13;
const AGENT_ID = 16;

const customerSocket = io("http://localhost:3000");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "Customer> ",
});

customerSocket.on("connect", () => {
  console.log("Customer connected:", customerSocket.id);
  customerSocket.emit("joinChat", {
    userId: CUSTOMER_ID,
    userType: "customer",
  });
});

customerSocket.on("newMessage", (msg) => console.log("Received:", msg.message));
customerSocket.on("messageSent", (msg) => console.log("Sent:", msg.message));

rl.prompt();
rl.on("line", (line) => {
  const msg = line.trim();
  if (!msg) return rl.prompt();

  customerSocket.emit("sendMessage", {
    senderId: CUSTOMER_ID,
    receiverId: AGENT_ID,
    senderType: "customer",
    receiverType: "agent",
    message: msg,
  });
  rl.prompt();
});
