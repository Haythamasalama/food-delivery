const config = require("../../config/db.config");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect || "mysql",
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.min,
    idle: config.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require("./user.model")(sequelize, Sequelize);
db.Customer = require("./customer.model")(sequelize, Sequelize);
db.MenuItem = require("./menuItem.model")(sequelize, Sequelize);
db.Order = require("./order.model")(sequelize, Sequelize);
db.Driver = require("./driver.model")(sequelize, Sequelize);
db.DriverLocation = require("./driverlocation.model")(sequelize, Sequelize);
db.Restaurant = require("./restaurants.model")(sequelize, Sequelize);
db.RestaurantNotification = require("./restaurantNotifications.model")(
  sequelize,
  Sequelize
);
db.Staff = require("./staff.model")(sequelize, Sequelize);
db.Agent = require("./agents.model")(sequelize, Sequelize);
db.ChatMessage = require("./chatMessage.model")(sequelize, Sequelize);
db.Announcement = require("./announcements.model")(sequelize, Sequelize);

// Establish relationships
// User → Customer / Driver
db.User.hasOne(db.Customer, { foreignKey: "user_id" });
db.Customer.belongsTo(db.User, { foreignKey: "user_id" });

db.User.hasOne(db.Driver, { foreignKey: "user_id" });
db.Driver.belongsTo(db.User, { foreignKey: "user_id" });

// Customer → Order
db.Customer.hasMany(db.Order, { foreignKey: "customer_id" });
db.Order.belongsTo(db.Customer, { foreignKey: "customer_id" });

// Driver → Order
db.Driver.hasMany(db.Order, { foreignKey: "driver_id" });
db.Order.belongsTo(db.Driver, { foreignKey: "driver_id" });

// Driver → Location
db.Driver.hasOne(db.DriverLocation, { foreignKey: "driver_id" });
db.DriverLocation.belongsTo(db.Driver, { foreignKey: "driver_id" });

// Restaurant → MenuItem
db.Restaurant.hasMany(db.MenuItem, { foreignKey: "restaurant_id" });
db.MenuItem.belongsTo(db.Restaurant, {
  foreignKey: "restaurant_id",
  as: "restaurant",
});

// Order → MenuItem
db.MenuItem.hasMany(db.Order, { foreignKey: "item_id" });
db.Order.belongsTo(db.MenuItem, { foreignKey: "item_id" });

// Restaurant → Notifications
db.Restaurant.hasMany(db.RestaurantNotification, {
  foreignKey: "restaurant_id",
});
db.RestaurantNotification.belongsTo(db.Restaurant, {
  foreignKey: "restaurant_id",
});

// Order → Notifications
db.Order.hasMany(db.RestaurantNotification, { foreignKey: "order_id" });
db.RestaurantNotification.belongsTo(db.Order, { foreignKey: "order_id" });

// Restaurant → Staff
db.Restaurant.hasMany(db.Staff, { foreignKey: "restaurant_id" });
db.Staff.belongsTo(db.Restaurant, { foreignKey: "restaurant_id" });

// User → Agent
db.User.hasOne(db.Agent, { foreignKey: "user_id" });
db.Agent.belongsTo(db.User, { foreignKey: "user_id" });

// Restaurant → Agent
db.Restaurant.hasMany(db.Agent, { foreignKey: "restaurant_id" });
db.Agent.belongsTo(db.Restaurant, { foreignKey: "restaurant_id" });

db.Customer.hasMany(db.ChatMessage, {
  foreignKey: "sender_id",
  scope: { senderType: "customer" },
});
db.Agent.hasMany(db.ChatMessage, {
  foreignKey: "sender_id",
  scope: { senderType: "agent" },
});

db.ChatMessage.belongsTo(db.Customer, {
  foreignKey: "sender_id",
  constraints: false,
});
db.ChatMessage.belongsTo(db.Agent, {
  foreignKey: "sender_id",
  constraints: false,
});

db.Customer.hasMany(db.ChatMessage, {
  foreignKey: "receiver_id",
  scope: { receiverType: "customer" },
});
db.Agent.hasMany(db.ChatMessage, {
  foreignKey: "receiver_id",
  scope: { receiverType: "agent" },
});

db.ChatMessage.belongsTo(db.Customer, {
  foreignKey: "receiver_id",
  as: "receiverCustomer",
  constraints: false,
});
db.ChatMessage.belongsTo(db.Agent, {
  foreignKey: "receiver_id",
  as: "receiverAgent",
  constraints: false,
});

module.exports = db;
