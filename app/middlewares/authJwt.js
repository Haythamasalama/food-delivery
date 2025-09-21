const jwt = require("jsonwebtoken");
const config = require("../../config/auth.config");
const db = require("../../db/models");

const User = db.User;
const TokenBlacklist = db.TokenBlacklist;

const verifyToken = async (req, res, next) => {
  try {
    let token = req.headers["authorization"];

    // Check if the token is present and in the Bearer format
    if (!token || !token.startsWith("Bearer ")) {
      return res.status(403).json({
        success: false,
        message: "No token provided or invalid token format!",
      });
    }

    // Extract the token part after "Bearer "
    token = token.split(" ")[1];

    // Check if the token is blacklisted
    const blacklistedToken = await TokenBlacklist.findOne({
      where: { token }
    });

    if (blacklistedToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized! Token has been invalidated.",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, config.secret);

    // Check token expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      // Add expired token to blacklist
      await TokenBlacklist.create({
        token,
        user_id: decoded.id,
        expires_at: new Date(decoded.exp * 1000),
        reason: 'expired'
      });

      return res.status(401).json({
        success: false,
        message: "Token has expired!",
      });
    }

    // Set user information in request
    req.user = {
      userId: decoded.id,
      role: decoded.role,
      email: decoded.email
    };

    next();
  } catch (err) {
    console.error("Token verification error:", err);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token has expired!",
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token!",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Unauthorized!",
    });
  }
};


const checkRoles = (allowedRoles, errorMessage = null) => {
  // Normalize to array
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required!",
        });
      }

      const userId = req.user.userId;
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: `User ${userId} not found!`,
        });
      }

      // Check if user role is in allowed roles
      if (roles.includes(user.role)) {
        return next();
      }

      // Custom error message or default
      const message = errorMessage || `Access denied. Required role(s): ${roles.join(', ')}`;

      return res.status(403).json({
        success: false,
        message,
      });
    } catch (error) {
      console.error("Role check error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during role verification",
      });
    }
  };
};

const blacklistToken = async (token, userId, reason = 'logout') => {
  try {
    const decoded = jwt.decode(token);
    const expiresAt = decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    await TokenBlacklist.create({
      token,
      user_id: userId,
      expires_at: expiresAt,
      reason
    });

    return { success: true };
  } catch (error) {
    console.error("Token blacklist error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Clean up expired tokens from blacklist (should be run periodically)
 */
const cleanupExpiredTokens = async () => {
  try {
    const result = await TokenBlacklist.destroy({
      where: {
        expires_at: {
          [db.Sequelize.Op.lt]: new Date()
        }
      }
    });
    console.log(`Cleaned up ${result} expired tokens from blacklist`);
    return result;
  } catch (error) {
    console.error("Token cleanup error:", error);
    return 0;
  }
};

// Specific role middleware (using the factory)
const checkAdmin = checkRoles(['admin'], 'Admin access required!');
const checkCustomer = checkRoles(['customer'], 'Customer access required!');
const checkDriver = checkRoles(['driver'], 'Driver access required!');
const checkStaff = checkRoles(['staff'], 'Staff access required!');
const checkAgent = checkRoles(['agent'], 'Agent access required!');

// Combined role middleware
const checkAdminOrDriver = checkRoles(['admin', 'driver'], 'Admin or Driver access required!');
const checkAdminOrDriverOrCustomer = checkRoles(['admin', 'driver', 'customer'], 'Admin, Driver, or Customer access required!');
const checkAgentOrCustomer = checkRoles(['agent', 'customer'], 'Agent or Customer access required!');

module.exports = {
  verifyToken,
  checkRoles,
  blacklistToken,
  cleanupExpiredTokens,
  // Specific role middleware
  checkAdmin,
  checkCustomer,
  checkDriver,
  checkStaff,
  checkAgent,
  // Combined role middleware
  checkAdminOrDriver,
  checkAdminOrDriverOrCustomer,
  checkAgentOrCustomer,
};