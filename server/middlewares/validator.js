// server/middleware/validator.js
const Joi = require("joi");

const validate = (schema) => (req, res, next) => {
  const data = { body: req.body, params: req.params, query: req.query };
  const { error } = schema.validate(data, {
    abortEarly: false,
    allowUnknown: true,
  });
  if (error)
    return res
      .status(400)
      .json({ errors: error.details.map((d) => d.message) });
  next();
};

module.exports = { validate };
