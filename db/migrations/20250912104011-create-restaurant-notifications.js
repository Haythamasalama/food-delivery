"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Restaurant_Notifications", {
      notificationId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "notification_id",
      },
      restaurantId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: "restaurant_id",
        references: {
          model: "Restaurants",
          key: "restaurant_id",
        },
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "order_id",
        references: {
          model: "Orders",
          key: "order_id",
        },
      },
      status: {
        type: Sequelize.ENUM("pending", "sent", "acknowledged"),
        defaultValue: "pending",
        field: "status",
      },
      payload: {
        type: Sequelize.JSON,
        allowNull: false,
        field: "payload",
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "delivered_at",
      },
      acknowledgedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "acknowledged_at",
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Restaurant_Notifications");
  },
};
