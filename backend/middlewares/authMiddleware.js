const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // If no token is provided, send a 401 error
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback');
    // Add the user ID to the request object
    req.userId = decoded.id;

    // Continue to the next middleware or route handler
    next();
  } catch (err) {
    // If the token is invalid or expired, send a 401 error
    console.error('Token verification error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticateUser;
