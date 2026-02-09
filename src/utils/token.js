const jwt = require('jsonwebtoken');

const TokenManager = {
  generateAccessToken: (payload) => {
    console.log('Generating token with payload:', payload);
    console.log(
      'Using key:',
      process.env.ACCESS_TOKEN_KEY ? 'Key exists' : 'Key missing!',
    );

    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, {
      expiresIn: process.env.ACCESS_TOKEN_AGE || '1h',
    });

    console.log('Generated token:', token.substring(0, 20) + '...');
    return token;
  },

  generateRefreshToken: (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_KEY);
  },

  verifyAccessToken: (token) => {
    console.log('Verifying token:', token.substring(0, 20) + '...');

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
      console.log('Token verified successfully:', decoded);
      return decoded;
    } catch (error) {
      console.log('Token verification failed:', error.name, error.message);

      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid authentication token');
      }
      throw new Error('Authentication failed: ' + error.message);
    }
  },

  verifyRefreshToken: (token) => {
    try {
      return jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  },
};

module.exports = TokenManager;
