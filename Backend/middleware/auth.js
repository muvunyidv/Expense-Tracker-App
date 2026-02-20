const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Defensive check: ensure the token contains necessary info
    if (!decoded.id) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    // UPDATED: Now passing both ID and ROLE to the rest of the app
    req.user = { 
      id: decoded.id,
      role: decoded.role // This allows req.user.role to work in planRoutes.js
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;