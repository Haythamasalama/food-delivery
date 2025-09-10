const Joi = require("joi");

const completeDriverProfileSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone must be in international format (+972...)",
      "string.empty": "Phone number is required",
    }),
  vehicleType: Joi.string().required().messages({
    "string.empty": "vehicle type is required",
  }),
});

module.exports = completeDriverProfileSchema;
