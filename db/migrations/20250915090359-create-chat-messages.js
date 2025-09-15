"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Chat_Messages", {
      messageId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "message_id",
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "sender_id",
      },
      receiverId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "receiver_id",
      },
      senderType: {
        type: Sequelize.ENUM("customer", "staff", "agent"),
        allowNull: false,
        field: "sender_type",
      },
      receiverType: {
        type: Sequelize.ENUM("customer", "staff", "agent"),
        allowNull: false,
        field: "receiver_type",
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "delivered_at",
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "read_at",
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
    await queryInterface.dropTable("Chat_Messages");
  },
};
