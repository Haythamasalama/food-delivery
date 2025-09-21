'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('token_blacklist', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      token: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      reason: {
        type: Sequelize.ENUM('logout', 'security', 'expired'),
        defaultValue: 'logout'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('token_blacklist', ['token'], {
      unique: true,
      name: 'idx_token_blacklist_token'
    });

    await queryInterface.addIndex('token_blacklist', ['user_id'], {
      name: 'idx_token_blacklist_user_id'
    });

    await queryInterface.addIndex('token_blacklist', ['expires_at'], {
      name: 'idx_token_blacklist_expires_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('token_blacklist');
  }
};