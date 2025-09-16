"use strict";
module.exports = (sequelize, Sequelize) => {
  const Announcement = sequelize.define(
    "Announcements",
    {
      announcementId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "announcement_id",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "title",
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
        field: "message",
      },
      audience: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: ["all"],
        field: "audience",
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
      tableName: "Announcements",
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );

  return Announcement;
};
