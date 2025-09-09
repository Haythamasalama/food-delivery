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

// Establish relationships
db.User.hasOne(db.Customer, {
  foreignKey: "user_id",
});

db.Customer.belongsTo(db.User, {
  foreignKey: "user_id",
});

module.exports = db;
