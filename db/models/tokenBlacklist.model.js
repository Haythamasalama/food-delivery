module.exports = (sequelize, Sequelize) => {
  const TokenBlacklist = sequelize.define(
    "TokenBlacklist",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      token: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      reason: {
        type: Sequelize.ENUM('logout', 'security', 'expired'),
        defaultValue: 'logout',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      tableName: "token_blacklist",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['token']
        },
        {
          fields: ['user_id']
        },
        {
          fields: ['expires_at']
        }
      ]
    }
  );

  return TokenBlacklist;
};