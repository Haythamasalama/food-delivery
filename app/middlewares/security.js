const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

/**
 * Rate limiting configuration
 */
const createRateLimit = (options = {}) => {
  const defaultOptions = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      res.status(429).json(options.message || defaultOptions.message);
    }
  };

  return rateLimit({ ...defaultOptions, ...options });
};

/**
 * General rate limiting
 */
const generalLimiter = createRateLimit();

/**
 * Stricter rate limiting for auth endpoints
 */
const authLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: 900 // 15 minutes
  }
});

/**
 * API rate limiting
 */
const apiLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs for API
});

/**
 * Helmet security configuration
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable COEP for now
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
});

/**
 * CORS configuration
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3001').split(',');

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Access-Token'
  ],
  maxAge: 86400 // 24 hours
};

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');

  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
};

/**
 * IP whitelist middleware (for admin routes)
 */
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    // In development, allow all IPs
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    if (allowedIPs.length === 0 || allowedIPs.includes(clientIP)) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: 'Access denied from this IP address'
    });
  };
};

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
  createRateLimit,
  helmetConfig,
  corsOptions,
  securityHeaders,
  ipWhitelist,
  cors: cors(corsOptions),
  helmet: helmetConfig
};