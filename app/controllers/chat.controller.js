const db = require("../../db/models");
const ChatMessage = db.ChatMessage;
const { Op } = require("sequelize");

// Valid types from DB enum
const VALID_TYPES = ["customer", "agent", "staff"];

exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.role;

    // Get from query or body (flexible)
    const { otherId, otherType } = req.query || req.body;

    if (!otherId || !otherType) {
      return res
        .status(400)
        .json({ message: "otherId and otherType are required" });
    }

    if (!VALID_TYPES.includes(otherType) || !VALID_TYPES.includes(userType)) {
      return res
        .status(400)
        .json({ message: "Invalid sender or receiver type" });
    }

    const messages = await ChatMessage.findAll({
      where: {
        [Op.or]: [
          {
            senderId: userId,
            senderType: userType,
            receiverId: otherId,
            receiverType: otherType,
          },
          {
            senderId: otherId,
            senderType: otherType,
            receiverId: userId,
            receiverType: userType,
          },
        ],
      },
      order: [["created_at", "ASC"]],
    });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ message: "Server error" });
  }
};
