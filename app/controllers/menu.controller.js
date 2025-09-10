const db = require("../../db/models");
const MenuItem = db.MenuItem;

exports.addMenuItem = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const newItem = await MenuItem.create({ name, description, price });
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
