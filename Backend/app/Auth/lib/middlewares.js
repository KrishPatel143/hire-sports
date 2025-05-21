const jwt = require('jsonwebtoken');
// Make sure this path correctly points to your Admin model
const Admin = require('../../../models/User/Admin');

const authMiddleware = {};

// Middleware to protect routes - verifies JWT token
// Middleware to protect routes - verifies JWT token
authMiddleware.protect = async (req, res, next) => {
  try {
    let token;
    console.log('Headers:', req.headers);

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted:', token ? 'Yes (length: ' + token.length + ')' : 'No');
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Not authorized. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your_jwt_secret'
      );
      console.log('Decoded token:', decoded);

      // Check if admin still exists
      const admin = await Admin.findById(decoded.id);
      console.log('Admin found in database:', admin ? 'Yes' : 'No');
      
      if (!admin) {
        return res.status(401).json({
          error: true,
          message: 'The admin belonging to this token no longer exists'
        });
      }

      // Check if admin is active
      if (!admin.isActive) {
        return res.status(403).json({
          error: true,
          message: 'Admin account is deactivated'
        });
      }

      // Grant access to protected route
      req.admin = decoded;
      req.user = decoded; // Add this line to also set req.user with the same data
      console.log('Setting req.admin and req.user:', req.admin);
      next();
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return res.status(401).json({
        error: true,
        message: 'Not authorized. Invalid token.',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Error in auth middleware:', error);
    res.status(500).json({
      error: true,
      message: 'Error in authentication middleware',
      details: error.message
    });
  }
};

// Middleware to restrict access based on admin role
authMiddleware.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log('Checking role restriction. Admin role:', req.admin?.role, 'Allowed roles:', roles);
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        error: true,
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// Middleware to verify if admin is a superadmin
authMiddleware.isSuperAdmin = (req, res, next) => {
  console.log('Checking superadmin status. Admin role:', req.admin?.role);
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({
      error: true,
      message: 'Access denied. Superadmin permission required.'
    });
  }
  next();
};

module.exports = authMiddleware;