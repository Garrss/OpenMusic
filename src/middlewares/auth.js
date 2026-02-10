const TokenManager = require('../utils/token');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: 'fail',
        message: 'Missing authentication token',
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader.startsWith('Token ')
        ? authHeader.substring(6)
        : authHeader;

    if (!token || token.length < 10) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid authentication token',
      });
    }

    const decoded = TokenManager.verifyAccessToken(token);

    req.user = {
      id: decoded.id,
      username: decoded.username || decoded.id,
    };

    next();
  } catch (error) {
    let message = 'Invalid authentication token';

    if (error.message.includes('expired')) {
      message = 'Access token expired';
    } else if (
      error.message.includes('jwt') ||
      error.message.includes('malformed')
    ) {
      message = 'Invalid authentication token';
    }

    return res.status(401).json({
      status: 'fail',
      message,
    });
  }
};

module.exports = authMiddleware;
