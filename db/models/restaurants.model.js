"use strict";
module.exports = (sequelize, Sequelize) => {
  const Restaurant = sequelize.define(
    "Restaurant",
    {
      restaurantId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "restaurant_id",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "name",
      },
      address: {
        type: Sequelize.STRING,
        field: "address",
      },
      phone: {
        type: Sequelize.STRING,
        field: "phone",
      },
      createdBy: {
        type: Sequelize.INTEGER,
        field: "created_by",
      },
    },
    {
      tableName: "Restaurants",
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );

  return Restaurant;
};
