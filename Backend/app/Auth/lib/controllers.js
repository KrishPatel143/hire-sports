// Update import path to match your project structure
// Make sure this path correctly points to your Admin model
const Admin = require('../../../models/User/Admin');

const authController = {};

// Register a new admin
authController.register = async (req, res) => {
  try {
    // Check if the email already exists
    const existingAdmin = await Admin.findOne({ email: req.body.email });
    if (existingAdmin) {
      return res.status(400).json({
        error: true,
        message: 'Email already in use'
      });
    }

    // Create new admin
    const newAdmin = new Admin({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'admin' // Default to 'admin' role if not specified
    });

    // Save admin to the database
    const savedAdmin = await newAdmin.save();

    // Generate JWT token
    const token = savedAdmin.generateAuthToken();

    // Return admin data and token (excluding password)
    const adminData = savedAdmin.toObject();
    delete adminData.password;

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: adminData,
      token
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: true,
      message: 'Error registering admin',
      details: error.message
    });
  }
};

// Login admin
authController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Please provide both email and password'
      });
    }

    // Find admin by email (include password for comparison)
    const admin = await Admin.findOne({ email }).select('+password');

    // Check if admin exists and password is correct
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({
        error: true,
        message: 'Invalid credentials'
      });
    }

    // Check if admin account is active
    if (!admin.isActive) {
      return res.status(403).json({
        error: true,
        message: 'Account is deactivated. Please contact super admin.'
      });
    }

    // Update last login time
    admin.lastLogin = Date.now();
    await admin.save();

    // Generate token
    const token = admin.generateAuthToken();

    // Return admin data and token (excluding password)
    const adminData = admin.toObject();
    delete adminData.password;

    res.json({
      message: 'Login successful',
      admin: adminData,
      token
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error during login',
      details: error.message
    });
  }
};

// Get current admin profile
authController.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    
    if (!admin) {
      return res.status(404).json({
        error: true,
        message: 'Admin not found'
      });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error fetching admin profile',
      details: error.message
    });
  }
};
authController.getProfilse = async (req, res) => {
  try {
    const admin = await Admin.find();
    
    if (!admin) {
      return res.status(404).json({
        error: true,
        message: 'Admin not found'
      });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error fetching admin profile',
      details: error.message
    });
  }
};
authController.getProfiles = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    
    if (!admin) {
      return res.status(404).json({
        error: true,
        message: 'Admin not found'
      });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error fetching admin profile',
      details: error.message
    });
  }
};

// Update admin profile
authController.updateProfile = async (req, res) => {
  try {
    // Don't allow role updates through this endpoint
    if (req.body.role) {
      delete req.body.role;
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.admin.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({
        error: true,
        message: 'Admin not found'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      admin: updatedAdmin
    });
  } catch (error) {
    res.status(400).json({
      error: true,
      message: 'Error updating profile',
      details: error.message
    });
  }
};

// Change admin password
authController.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: true,
        message: 'Please provide both current and new password'
      });
    }

    // Find admin with password
    const admin = await Admin.findById(req.admin.id).select('+password');

    // Verify current password
    if (!(await admin.comparePassword(currentPassword))) {
      return res.status(401).json({
        error: true,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(400).json({
      error: true,
      message: 'Error changing password',
      details: error.message
    });
  }
};

// Super Admin Operations

// Get all admins (superadmin only)
authController.getAllAdmins = async (req, res) => {
  try {
    // Ensure requester is a superadmin
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({
        error: true,
        message: 'Access denied. Superadmin permission required.'
      });
    }

    const admins = await Admin.find().select('-password');
    
    res.json(admins);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error fetching admin list',
      details: error.message
    });
  }
};

// Toggle admin active status (superadmin only)
authController.toggleAdminStatus = async (req, res) => {
  try {
    // Ensure requester is a superadmin
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({
        error: true,
        message: 'Access denied. Superadmin permission required.'
      });
    }

    const admin = await Admin.findById(req.params.adminId);
    
    if (!admin) {
      return res.status(404).json({
        error: true,
        message: 'Admin not found'
      });
    }

    // Prevent deactivation of own account
    if (admin._id.toString() === req.admin.id) {
      return res.status(400).json({
        error: true,
        message: 'Cannot deactivate your own account'
      });
    }

    // Toggle status
    admin.isActive = !admin.isActive;
    await admin.save();

    res.json({
      message: `Admin ${admin.isActive ? 'activated' : 'deactivated'} successfully`,
      admin
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error toggling admin status',
      details: error.message
    });
  }
};

module.exports = authController;