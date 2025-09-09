"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      userId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: "user_id",
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "full_name",
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
        field: "email",
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true, // ✅ allow null for OAuth users
        field: "password",
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "customer", // ✅ default for Google users
        field: "role",
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true, // ✅ Google users are verified by default
        field: "is_verified",
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
    await queryInterface.dropTable("Users");
  },
};
