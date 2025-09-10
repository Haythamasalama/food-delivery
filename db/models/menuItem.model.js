"use strict";
module.exports = (sequelize, Sequelize) => {
  const MenuItem = sequelize.define(
    "Menu_Items",
    {
      itemId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: "item_id",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "name",
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
        field: "description",
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
        field: "price",
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
      tableName: "Menu_Items",
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return MenuItem;
};
