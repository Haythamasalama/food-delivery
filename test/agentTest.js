const { io } = require("socket.io-client");
const readline = require("readline");

const CUSTOMER_ID = 13;
const AGENT_ID = 16;

const agentSocket = io("http://localhost:3000");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "Agent> ",
});

agentSocket.on("connect", () => {
  console.log("Agent connected:", agentSocket.id);
  agentSocket.emit("joinChat", { userId: AGENT_ID, userType: "agent" });
});

agentSocket.on("newMessage", (msg) => console.log("Received:", msg.message));
agentSocket.on("messageSent", (msg) => console.log("Sent:", msg.message));

rl.prompt();
rl.on("line", (line) => {
  const msg = line.trim();
  if (!msg) return rl.prompt();

  agentSocket.emit("sendMessage", {
    senderId: AGENT_ID,
    receiverId: CUSTOMER_ID,
    senderType: "agent",
    receiverType: "customer",
    message: msg,
  });
  rl.prompt();
});
