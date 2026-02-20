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
    if (!decoded.id || !decoded.tenantId) {
      return res.status(401).json({ error: 'Invalid token payload: Missing User or Tenant ID' });
    }

    // Pass the essential identity data to the request object
    req.user = { 
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      tenantId: decoded.tenantId // This is the "Silo" ID that locks data access
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