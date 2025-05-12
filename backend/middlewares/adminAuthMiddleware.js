const jwt = require('jsonwebtoken');

// ✅ Verifies the token and attaches admin info to req.user
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Admin token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback');
    req.user = decoded; // ⬅ used by isSuperAdmin
    next();
  } catch (err) {
    console.error('Admin token verification failed:', err);
    return res.status(403).json({ message: 'Invalid or expired admin token' });
  }
};

module.exports = { verifyToken };
