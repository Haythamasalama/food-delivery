const db = require("../../db/models");
const MenuItem = db.MenuItem;
const { helpers } = require("../utils/socket");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads/menu-items";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

// Filter only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed!"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
}).single("image");

exports.uploadMenuItemImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err)
      return res.status(400).json({ status: "error", message: err.message });

    const { itemId } = req.body;
    if (!itemId)
      return res
        .status(400)
        .json({ status: "error", message: "itemId is required" });

    try {
      const menuItem = await MenuItem.findByPk(itemId);
      if (!menuItem)
        return res
          .status(404)
          .json({ status: "error", message: "Menu item not found" });

      // Send initial progress update via WebSocket
      if (helpers.io)
        helpers.io
          .to(`menuItem_${itemId}`)
          .emit("uploadProgress", { progress: 10 });

      const inputPath = req.file.path;
      const outputPath = `./uploads/menu-items/resized-${req.file.filename}`;

      // Simulate processing (resize + compression)
      await sharp(inputPath)
        .resize(800, 800, { fit: "inside" })
        .jpeg({ quality: 80 })
        .toFile(outputPath);

      // Update DB with image path
      menuItem.imageUrl = outputPath;
      await menuItem.save();

      // Send final status via WebSocket
      if (helpers.io)
        helpers.io
          .to(`menuItem_${itemId}`)
          .emit("uploadComplete", { imageUrl: outputPath });

      res.status(200).json({
        status: "success",
        message: "Image uploaded and processed successfully",
        imageUrl: outputPath,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ status: "error", message: "Failed to process image" });
    }
  });
};

exports.addMenuItem = async (req, res) => {
  try {
    const { name, description, price, restaurantId } = req.body;
    const newItem = await MenuItem.create({
      name,
      description,
      price,
      restaurantId,
    });
    res.status(201).send({ message: "Menu item added successfully", newItem });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getMenu = async (req, res) => {
  try {
    const items = await MenuItem.findAll();
    res.status(200).send({ items });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
