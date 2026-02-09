const TokenManager = require('../utils/token');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Debug: Log untuk melihat apa yang diterima
    console.log('\n=== AUTH MIDDLEWARE DEBUG ===');
    console.log('URL:', req.url);
    console.log('Auth Header:', authHeader);
    console.log('Method:', req.method);
    console.log('Body:', req.body);

    if (!authHeader) {
      console.log('ERROR: No auth header');
      return res.status(401).json({
        status: 'fail',
        message: 'Missing authentication token',
      });
    }

    // Ekstrak token (support multiple formats)
    let token;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (authHeader.startsWith('Token ')) {
      token = authHeader.substring(6);
    } else {
      token = authHeader;
    }

    console.log('Token extracted:', token.substring(0, 20) + '...');
    console.log('Token length:', token.length);

    if (!token || token.length < 10) {
      console.log('ERROR: Token too short or empty');
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid authentication token',
      });
    }

    const decoded = TokenManager.verifyAccessToken(token);
    console.log('Token decoded successfully:', decoded);

    req.user = {
      id: decoded.id,
      username: decoded.username || decoded.id,
    };

    console.log('User set:', req.user);
    console.log('=== AUTH SUCCESS ===\n');

    next();
  } catch (error) {
    console.log('AUTH ERROR:', error.message);
    console.log('Error stack:', error.stack);

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
      message: message,
    });
  }
};

module.exports = authMiddleware;
