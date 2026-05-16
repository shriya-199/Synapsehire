const sendSuccess = (res, data, message = 'Success', statusCode = 200, meta = undefined) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    meta
  });
};

const sendCreated = (res, data, message = 'Created') => {
  sendSuccess(res, data, message, 201);
};

module.exports = {
  sendSuccess,
  sendCreated
};
