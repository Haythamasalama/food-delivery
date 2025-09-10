"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Drivers", {
      driverId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: "driver_id",
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "full_name",
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      vehicleType: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "vehicle_type",
      },
      status: {
        type: Sequelize.ENUM("available", "delivering", "offline"),
        defaultValue: "available",
        allowNull: false,
        field: "status",
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Drivers");
  },
};
