// app/controllers/announcement.controller.js
const db = require("../../db/models");
const { helpers } = require("../utils/socket");
const Announcement = db.Announcement;

const ALLOWED_ROLES = ["all", "customer", "driver", "staff", "agent"];

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, audience } = req.body;

    // Validate audience input
    if (!Array.isArray(audience) || audience.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Audience must be a non-empty array",
      });
    }

    // Check each role is allowed
    const invalid = audience.filter((role) => !ALLOWED_ROLES.includes(role));
    if (invalid.length > 0) {
      return res.status(400).json({
        status: "error",
        message: `Invalid audience roles: ${invalid.join(", ")}`,
      });
    }

    // If "all" is included, ignore the rest to avoid conflicts
    const finalAudience = audience.includes("all") ? ["all"] : audience;

    const announcement = await Announcement.create({
      title,
      message,
      audience: finalAudience,
    });

    // Broadcast via socket if active
    if (helpers.io) {
      if (finalAudience.includes("all")) {
        helpers.io.emit("announcement", announcement);
      } else {
        finalAudience.forEach((role) => {
          helpers.io.to(`role_${role}`).emit("announcement", announcement);
        });
      }
    }

    return res.status(201).json({
      status: "success",
      announcement,
    });
  } catch (err) {
    console.error("Error creating announcement:", err.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to create announcement",
    });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const role = req.user.role;

    const announcements = await Announcement.findAll({
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
    });

    return res.json({ announcements });
  } catch (err) {
    console.error("Error fetching announcements:", err.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch announcements",
    });
  }
};
