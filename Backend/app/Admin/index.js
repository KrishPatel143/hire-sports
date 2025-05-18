const express = require('express');
const router = express.Router();
const controllers = require('./lib/controllers');
const authMiddleware = require('../Auth/lib/middlewares');

// Dashboard statistics
router.get('/dashboard', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.getDashboardStats);

// Admin management (superadmin only)
router.get('/admins', authMiddleware.protect, authMiddleware.isSuperAdmin, controllers.getAllAdmins);
router.post('/admins', authMiddleware.protect, authMiddleware.isSuperAdmin, controllers.createAdmin);
router.get('/admins/:adminId', authMiddleware.protect, authMiddleware.isSuperAdmin, controllers.getAdminDetails);
router.put('/admins/:adminId', authMiddleware.protect, authMiddleware.isSuperAdmin, controllers.updateAdmin);
router.patch('/admins/:adminId/status', authMiddleware.protect, authMiddleware.isSuperAdmin, controllers.toggleAdminStatus);

// Product management
router.get('/products', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.getProducts);
router.get('/all/products', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.getAllProducts);
router.post('/products', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.createProduct);
router.get('/products/:productId', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.getProductDetails);
router.put('/products/:productId', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.updateProduct);
router.delete('/products/:productId', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.deleteProduct);
router.patch('/products/:productId/toggle-active', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.toggleProductStatus);
router.post('/products/bulk-import', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.bulkImportProducts);
router.post('/products/bulk-update', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.bulkUpdateProducts);

// Order management
router.get('/orders', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.getOrders);
router.get('/orders/:orderId', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.getOrderDetails);
router.put('/orders/:orderId/status', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.updateOrderStatus);
router.put('/orders/:orderId/payment', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.updatePaymentStatus);

// User management
router.get('/users', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.getUsers);
router.get('/users/:userId', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.getUserDetails);
router.put('/users/:userId', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.updateUser);
router.patch('/users/:userId/status', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.toggleUserStatus);

// Category management
router.get('/categories', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.getCategories);
router.post('/categories', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.createCategory);
router.put('/categories/:categoryId', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.updateCategory);
router.delete('/categories/:categoryId', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.deleteCategory);

module.exports = router;