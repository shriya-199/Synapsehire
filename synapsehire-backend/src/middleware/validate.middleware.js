const ApiError = require('../utils/ApiError');

const validate = (schema, source = 'body') => (req, _res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    const details = error.details.map((item) => ({
      field: item.path.join('.'),
      message: item.message
    }));

    return next(new ApiError(400, 'Request validation failed', details));
  }

  req[source] = value;
  return next();
};

module.exports = validate;
