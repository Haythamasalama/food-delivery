const Joi = require("joi");

const completeProfileSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone must be in international format (+972...)",
      "string.empty": "Phone number is required",
    }),
  location: Joi.string().min(2).max(255).required().messages({
    "string.empty": "Location is required",
    "string.min": "Location must be at least 2 characters",
  }),
});

module.exports = completeProfileSchema;
