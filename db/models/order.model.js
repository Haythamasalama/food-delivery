"use strict";
module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define(
    "Orders",
    {
      orderId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: "order_id",
      },
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "customers",
          key: "customer_id",
        },
        field: "customer_id",
      },
      itemId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Menu_Items",
          key: "item_id",
        },
        field: "item_id",
      },
      driverId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Drivers",
          key: "driver_id",
        },
        field: "driver_id",
      },
      status: {
        type: Sequelize.ENUM(
          "confirmed",
          "preparing",
          "ready",
          "picked_up",
          "delivered"
        ),
        defaultValue: "confirmed",
        allowNull: false,
        field: "status",
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: "quantity",
      },
      totalPrice: {
        type: Sequelize.FLOAT,
        allowNull: false,
        field: "total_price",
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
    },
    {
      tableName: "Orders",
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );

  return Order;
};
