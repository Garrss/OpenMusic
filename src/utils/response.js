const successResponse = (
  res,
  { data = undefined, message = null, statusCode = 200 },
) => {
  const response = {
    status: 'success',
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
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

const unauthorizedResponse = (res, { message = 'Missing authentication' }) => {
  return res.status(401).json({
    status: 'fail',
    message,
  });
};

const forbiddenResponse = (
  res,
  { message = 'Anda tidak berhak mengakses resource ini' },
) => {
  return res.status(403).json({
    status: 'fail',
    message,
  });
};

module.exports = { successResponse, failResponse, errorResponse, unauthorizedResponse, forbiddenResponse };
