const winston = require('winston');
const morgan = require('morgan');
const path = require('path');

/**
 * Configure Winston logger
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    })
  ),
  defaultMeta: {
    service: 'food-delivery-api',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],

  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'exceptions.log')
    })
  ],

  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'rejections.log')
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ level, message, timestamp }) => {
        return `${timestamp} [${level}]: ${message}`;
      })
    )
  }));
}

/**
 * Morgan HTTP request logging middleware
 */
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

const morganMiddleware = morgan(morganFormat, {
  stream: {
    write: (message) => {
      // Log HTTP requests using Winston
      logger.info(message.trim());
    }
  },
  // Skip logging in test environment
  skip: () => process.env.NODE_ENV === 'test'
});

/**
 * Database operation logger
 */
const dbLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'database.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 3
    })
  ]
});

/**
 * Security events logger
 */
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'security.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),
    // Also log to console in development
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ level, message, timestamp, ...meta }) => {
            return `${timestamp} [SECURITY-${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
          })
        )
      })
    ] : [])
  ]
});

/**
 * Performance logger
 */
const performanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'performance.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 3
    })
  ]
});

/**
 * Log security events
 */
const logSecurityEvent = (event, details = {}) => {
  securityLogger.warn(event, {
    ...details,
    timestamp: new Date().toISOString(),
    severity: 'medium'
  });
};

/**
 * Log performance metrics
 */
const logPerformance = (operation, duration, details = {}) => {
  performanceLogger.info(`${operation} completed`, {
    operation,
    duration: `${duration}ms`,
    ...details,
    timestamp: new Date().toISOString()
  });
};

/**
 * Request timing middleware
 */
const requestTimer = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    // Log slow requests
    if (duration > 1000) { // Log requests taking more than 1 second
      logPerformance(`Slow ${req.method} ${req.originalUrl}`, duration, {
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
  });

  next();
};

module.exports = {
  logger,
  morganMiddleware,
  dbLogger,
  securityLogger,
  performanceLogger,
  logSecurityEvent,
  logPerformance,
  requestTimer
};