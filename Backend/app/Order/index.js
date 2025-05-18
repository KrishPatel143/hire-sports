const express = require('express');
const router = express.Router();
const controllers = require('./lib/controllers');
const authMiddleware = require('../Auth/lib/middlewares');

// User routes
router.get('/myorders', authMiddleware.protect, controllers.getUserOrders);
router.post('/', authMiddleware.protect, controllers.createOrder);
router.post('/:orderId/cancel', authMiddleware.protect, controllers.cancelOrder);
router.get('/:orderId', authMiddleware.protect, controllers.getOrderDetails);

// Admin routes
router.get('/', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.getAllOrders);
router.get('/stats', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.getOrderStats);
router.put('/:orderId/status', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.updateOrderStatus);
router.put('/:orderId/payment', authMiddleware.protect, authMiddleware.restrictTo('admin', 'superadmin'), controllers.updatePaymentStatus);

module.exports = router;