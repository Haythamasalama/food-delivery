const express = require("express");
const http = require("http");
require("dotenv").config();

// Import middleware
const { morganMiddleware, logger, requestTimer } = require("./config/logger");
const { initSocket } = require("./app/utils/socket");
const {
  cors,
  helmet,
  generalLimiter,
  apiLimiter,
  authLimiter,
  securityHeaders
} = require("./app/middlewares/security");
const { notFound, errorHandler } = require("./app/middlewares/errorHandler");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");

// Import routes
const authRoutes = require("./app/routes/auth.routes");
const adminRoutes = require("./app/routes/admin.routes");
const customerRoutes = require("./app/routes/customer.routes");
const menuRoutes = require("./app/routes/menu.routes");
const orderRoutes = require("./app/routes/order.routes");
const driverRoutes = require("./app/routes/driver.routes");
const driverLocationRoutes = require("./app/routes/driverLocation.routes");
const restaurantRoutes = require("./app/routes/restaurant.routes");
const staffRoutes = require("./app/routes/staff.routes");
const agentRoutes = require("./app/routes/agent.routes");
const chatRoutes = require("./app/routes/chat.routes");
const announcementRoutes = require("./app/routes/announcement.routes");

const app = express();
const server = http.createServer(app);

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// ========================================
// SECURITY MIDDLEWARE (ORDER MATTERS!)
// ========================================

// 1. Security headers (should be first)
app.use(securityHeaders);

// 2. Helmet for additional security headers
app.use(helmet);

// 3. CORS configuration
app.use(cors);

// 4. General rate limiting (before parsing body)
app.use(generalLimiter);

// 5. Request logging (early but after security)
app.use(morganMiddleware);

// 6. Request timing for performance monitoring
app.use(requestTimer);

// ========================================
// PARSING MIDDLEWARE
// ========================================

// 7. Body parsing middleware (BEFORE session and passport)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 8. Cookie parser (BEFORE session)
app.use(cookieParser());

// ========================================
// SESSION AND AUTHENTICATION
// ========================================

// 9. Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-change-in-production",
    resave: false,
    saveUninitialized: false, // Changed to false for security
    name: 'sessionId', // Change default session name
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true, // Prevent XSS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict' // CSRF protection
    }
  })
);

// 10. Passport initialization (AFTER session)
app.use(passport.initialize());
app.use(passport.session());

// ========================================
// DATABASE CONNECTION
// ========================================

// 11. Database sync
const db = require("./db/models");

const syncDatabase = async () => {
  try {
    await db.sequelize.authenticate();
    logger.info("Database connection established successfully");

    // Sync database - use basic sync to avoid foreign key conflicts
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ force: false });
      logger.info("Database synchronized successfully");
    } else {
      await db.sequelize.sync({ force: false });
      logger.info("Database sync completed");
    }
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

syncDatabase();

// ========================================
// SOCKET.IO INITIALIZATION
// ========================================

// 12. Initialize Socket.IO
initSocket(server);

// ========================================
// API ROUTES WITH RATE LIMITING
// ========================================

// 13. Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 14. API versioning and rate limiting
app.use('/api', apiLimiter); // Apply API rate limiting to all API routes

// Auth routes with stricter rate limiting
app.use("/api/auth", authLimiter, authRoutes);

// Other API routes
app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/driver-location", driverLocationRoutes);
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/announcement", announcementRoutes);

// ========================================
// ERROR HANDLING
// ========================================

// 15. 404 handler for undefined routes
app.use(notFound);

// 16. Global error handler (MUST be last)
app.use(errorHandler);

// ========================================
// SERVER STARTUP
// ========================================

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

server.listen(PORT, () => {
  logger.info(`🚀 Food Delivery Server started successfully`);
  logger.info(`📡 Environment: ${NODE_ENV}`);
  logger.info(`🌍 Server running on port ${PORT}`);
  logger.info(`🔗 Health check available at: http://localhost:${PORT}/health`);

  if (NODE_ENV === 'development') {
    logger.info(`📚 API Documentation: http://localhost:${PORT}/api`);
  }
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await db.sequelize.close();
      logger.info('Database connection closed');
    } catch (error) {
      logger.error('Error closing database connection:', error);
    }

    logger.info('Graceful shutdown completed');
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = app;