"use strict";
module.exports = (sequelize, Sequelize) => {
  const Staff = sequelize.define(
    "Staffs",
    {
      staffId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: "staff_id",
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
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        field: "user_id",
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
      tableName: "Staffs",
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );

  return Staff;
};
