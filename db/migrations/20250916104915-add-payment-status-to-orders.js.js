"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Orders", "payment_status", {
      type: Sequelize.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
      allowNull: false,
      field: "payment_status",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Orders", "payment_status");
  },
};
