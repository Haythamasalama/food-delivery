"use strict";
module.exports = (sequelize, Sequelize) => {
  const DriverLocation = sequelize.define(
    "Driver_Locations",
    {
      driverLocationId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: "driver_location_id",
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
      latitude: {
        type: Sequelize.FLOAT,
      },
      longitude: {
        type: Sequelize.FLOAT,
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
      tableName: "Driver_Locations",
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );

  return DriverLocation;
};
