"use strict";
module.exports = (sequelize, Sequelize) => {
  const Customer = sequelize.define("Customers", {
    customerId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
      field: "customer_id",
    },
    location: {
      type: Sequelize.STRING,
      allowNull: true,
      field: "location",
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: true,
      field: "phone",
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
      field: "user_id",
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      field: "updated_at",
    },
    deletedAt: {
      type: Sequelize.DATE,
      allowNull: true,
      field: "deleted_at",
    },
  });

  return Customer;
};
