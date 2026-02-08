const successResponse = (
  res,
  { data = null, message = null, statusCode = 200 },
) => {
  const response = {
    status: 'success',
  };

  if (data) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

const failResponse = (res, { message, statusCode = 400 }) => {
  return res.status(statusCode).json({
    status: 'fail',
    message,
  });
};

const errorResponse = (res, { message, statusCode = 500 }) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
  });
};

module.exports = { successResponse, failResponse, errorResponse };
