// app/controllers/restaurant.controller.js
const db = require("../../db/models");
const Restaurant = db.Restaurant;
const RestaurantNotification = db.RestaurantNotification;
const MenuItem = db.MenuItem;

/**
 * Create a restaurant (admin creates or owner)
 * body: { name, address, phone, createdBy }
 */
exports.createRestaurant = async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    const createdBy = req.user?.userId || null;

    const restaurant = await Restaurant.create({
      name,
      address,
      phone,
      createdBy,
    });

    res.status(201).send({ message: "Restaurant created", restaurant });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

/**
 * Get restaurants (simple list)
 */
exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
    res.status(200).send({ restaurants });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

/**
 * Get pending notifications for restaurant (for REST fallback or admin view)
 */
exports.getPendingNotifications = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const notifications = await RestaurantNotification.findAll({
      where: { restaurantId, status: "pending" },
    });

    res.status(200).send({ notifications });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
