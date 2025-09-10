const Joi = require("joi");

// Signup validation
const signupSchema = Joi.object({
  fullName: Joi.string().min(3).required().messages({
    "string.empty": "Full name is required",
    "string.min": "Full name should have at least 3 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password should have at least 6 characters",
  }),
  role: Joi.string().valid("customer", "driver").required().messages({
    "any.only": "Role must be one of 'customer', or 'driver'",
    "string.empty": "Role is required",
  }),
});

// Login validation
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password should have at least 6 characters",
  }),
});

// Middleware generator
const validateSignup = (req, res, next) => {
  const { error } = signupSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors });
  }
  next();
};

module.exports = {
  validateSignup,
  validateLogin,
};
