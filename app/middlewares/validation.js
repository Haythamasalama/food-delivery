const { validationResult, body, param, query } = require('express-validator');
const { validationError } = require('./errorHandler');

/**
 * Handle validation results
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(validationError(errors.array()));
  }

  next();
};

/**
 * Joi validation middleware (backward compatibility)
 */
const validateJoi = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.reduce((acc, detail) => {
          const key = detail.path.join('.');
          acc[key] = detail.message;
          return acc;
        }, {})
      });
    }
    next();
  };
};

/**
 * Common validation rules
 */
const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  confirmPassword: body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),

  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  phone: body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  id: param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),

  price: body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  quantity: body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  role: body('role')
    .isIn(['admin', 'customer', 'driver', 'staff', 'agent'])
    .withMessage('Invalid role specified'),

  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],

  search: query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
};

/**
 * Validation schemas for different endpoints
 */
const validationSchemas = {
  // Auth validations
  register: [
    commonValidations.name,
    commonValidations.email,
    commonValidations.password,
    commonValidations.confirmPassword,
    commonValidations.phone,
    commonValidations.role,
    handleValidation
  ],

  login: [
    commonValidations.email,
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidation
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    commonValidations.password,
    commonValidations.confirmPassword,
    handleValidation
  ],

  forgotPassword: [
    commonValidations.email,
    handleValidation
  ],

  resetPassword: [
    param('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    commonValidations.password,
    commonValidations.confirmPassword,
    handleValidation
  ],

  // User validations
  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),
    handleValidation
  ],

  // Menu item validations
  createMenuItem: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Menu item name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    commonValidations.price,
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required'),
    body('restaurant_id')
      .isInt({ min: 1 })
      .withMessage('Valid restaurant ID is required'),
    handleValidation
  ],

  updateMenuItem: [
    commonValidations.id,
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Menu item name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    handleValidation
  ],

  // Order validations
  createOrder: [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Order must contain at least one item'),
    body('items.*.item_id')
      .isInt({ min: 1 })
      .withMessage('Valid item ID is required'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('delivery_address')
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage('Delivery address must be between 10 and 200 characters'),
    handleValidation
  ],

  // Common parameter validations
  paramId: [
    commonValidations.id,
    handleValidation
  ],

  // Pagination validations
  pagination: [
    ...commonValidations.pagination,
    commonValidations.search,
    handleValidation
  ],
};

module.exports = {
  handleValidation,
  validateJoi,
  commonValidations,
  validationSchemas,
  // Export individual validation chains for custom use
  body,
  param,
  query,
  validationResult
};