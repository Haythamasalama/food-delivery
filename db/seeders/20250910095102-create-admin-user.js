"use strict";
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("Admin@123", 10); // default admin password

    await queryInterface.bulkInsert(
      "Users",
      [
        {
          full_name: "Super Admin",
          email: "admin@foodfast.com",
          password: hashedPassword,
          role: "admin",
          is_verified: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Users",
      { email: "admin@foodfast.com" },
      {}
    );
  },
};
