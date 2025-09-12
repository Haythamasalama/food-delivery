const Joi = require("joi");

const completeStaffProfileSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone must be in international format (+972...)",
      "string.empty": "Phone number is required",
    }),
  restaurantId: Joi.number().required().messages({
    "string.empty": "restaurantId is required",
  }),
});

module.exports = completeStaffProfileSchema;
