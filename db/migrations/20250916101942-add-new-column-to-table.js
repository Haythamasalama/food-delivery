"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Menu_Items", "image_url", {
      type: Sequelize.STRING,
      allowNull: true,
      field: "image_url",
      comment: "URL/path of the menu item image",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Menu_Items", "image_url");
  },
};
