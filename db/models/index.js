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

// Establish relationships
db.User.hasOne(db.Customer, { foreignKey: "user_id" });
db.Customer.belongsTo(db.User, { foreignKey: "user_id" });

db.User.hasOne(db.Driver, { foreignKey: "user_id" });
db.Driver.belongsTo(db.User, { foreignKey: "user_id" });

db.Customer.hasMany(db.Order, { foreignKey: "customer_id" });
db.Order.belongsTo(db.Customer, { foreignKey: "customer_id" });

db.MenuItem.hasMany(db.Order, { foreignKey: "item_id" });
db.Order.belongsTo(db.MenuItem, { foreignKey: "item_id" });

db.Driver.hasMany(db.Order, { foreignKey: "driver_id" });
db.Order.belongsTo(db.Driver, { foreignKey: "driver_id" });

db.Driver.hasOne(db.DriverLocation, { foreignKey: "driver_id" });
db.DriverLocation.belongsTo(db.Driver, { foreignKey: "driver_id" });

module.exports = db;
