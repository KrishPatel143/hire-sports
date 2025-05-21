const Order = require('../../../models/Order/Order');
const Product = require('../../../models/Products/Product');

const controllers = {};

// Get all orders - Admin route
controllers.getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      sortBy = 'newest',
      startDate,
      endDate,
      userId
    } = req.query;

    const query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1); // Include the end date
        query.createdAt.$lt = endDateObj;
      }
    }
    
    // Filter by user
    if (userId) {
      query.user = userId;
    }

    const sortOptions = {
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 },
      'total-high': { totalPrice: -1 },
      'total-low': { totalPrice: 1 }
    };

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort(sortOptions[sortBy] || sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      totalOrders: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      orders
    });
  } catch (error) {
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching orders', 
      details: error.message 
    });
  }
};

// Get single order details
controllers.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email')
      .populate({
        path: 'orderItems.product',
        select: 'name image'
      });

    if (!order) {
      return res.status(404).json({ 
        error: true, 
        message: 'Order not found' 
      });
    }

    // Check if user is authorized to view this order
    // If not admin, check if the order belongs to the current user
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && 
        order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        error: true, 
        message: 'Not authorized to view this order' 
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching order details', 
      details: error.message 
    });
  }
};

// Create a new order
controllers.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    } = req.body;
    
    console.log(req.user);
    
    // Validate that order items exist
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'No order items'
      });
    }

    // Map the frontend address fields to the required backend fields
    const mappedShippingAddress = {
      fullName: shippingAddress.fullName,
      phoneNumber: shippingAddress.phone, // Map phone to phoneNumber
      email: shippingAddress.email,
      addressLine1: shippingAddress.address, // Map address to addressLine1
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country
    };


    // Validate product availability and update order items with current prices
    const updatedOrderItems = await Promise.all(orderItems.map(async (item) => {
      const product = await Product.findById(item.product);
      
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }
      
      if (product.stock < item.quantity) {
        throw new Error(`Product ${product.name} is out of stock`);
      }
      
      return {
        ...item,
        price: product.price,
        name: product.name
      };
    }));

    // Create the new order
    const newOrder = new Order({
      user: req.user.id,
      orderItems: updatedOrderItems,
      shippingAddress: mappedShippingAddress,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      orderStatus: 'pending'
    });

    // Save the order
    const savedOrder = await newOrder.save();

    // Update product stock
    await Promise.all(orderItems.map(async (item) => {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();
    }));

    res.status(201).json({
      message: 'Order created successfully',
      order: savedOrder
    });
  } catch (error) {
    console.log(error);
    
    res.status(400).json({ 
      error: true, 
      message: 'Error creating order', 
      details: error.message 
    });
  }
};

// Update order status - Admin route
controllers.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingNumber, notes } = req.body;
    
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ 
        error: true, 
        message: 'Order not found' 
      });
    }

    // Update order fields
    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.notes = notes;

    // Handle specific status updates
    if (orderStatus === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    // If order is cancelled, restore the product stock
    if (orderStatus === 'cancelled' && order.orderStatus !== 'cancelled') {
      await Promise.all(order.orderItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }));
    }

    const updatedOrder = await order.save();

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    res.status(400).json({ 
      error: true, 
      message: 'Error updating order status', 
      details: error.message 
    });
  }
};

// Update payment status
controllers.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentResult } = req.body;
    
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ 
        error: true, 
        message: 'Order not found' 
      });
    }

    // Update payment information
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (paymentResult) order.paymentResult = paymentResult;

    // Mark as paid if payment is completed
    if (paymentStatus === 'completed') {
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    const updatedOrder = await order.save();

    res.json({
      message: 'Payment status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    res.status(400).json({ 
      error: true, 
      message: 'Error updating payment status', 
      details: error.message 
    });
  }
};

// Cancel order - Can be used by users for their own orders
controllers.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ 
        error: true, 
        message: 'Order not found' 
      });
    }

    // Check if user is authorized to cancel this order
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && 
        order.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        error: true, 
        message: 'Not authorized to cancel this order' 
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'processing'].includes(order.orderStatus)) {
      return res.status(400).json({ 
        error: true, 
        message: 'Order cannot be cancelled at this stage' 
      });
    }

    // Update order status
    order.orderStatus = 'cancelled';

    // Restore product stock
    await Promise.all(order.orderItems.map(async (item) => {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }));

    const updatedOrder = await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order: updatedOrder
    });
  } catch (error) {
    res.status(400).json({ 
      error: true, 
      message: 'Error cancelling order', 
      details: error.message 
    });
  }
};

// Get user's orders
controllers.getUserOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      sortBy = 'newest',
      startDate,
      endDate
    } = req.query;

    const query = { user: req.user.id };
    
    // Filter by status
    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1); // Include the end date
        query.createdAt.$lt = endDateObj;
      }
    }

    const sortOptions = {
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 },
      'total-high': { totalPrice: -1 },
      'total-low': { totalPrice: 1 }
    };

    const orders = await Order.find(query)
      .populate({
        path: 'orderItems.product',
        select: 'name image'
      })
      .sort(sortOptions[sortBy] || sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      totalOrders: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      orders
    });
  } catch (error) {
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching user orders', 
      details: error.message 
    });
  }
};

// Get order statistics - Admin route
controllers.getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Total orders
    const totalOrders = await Order.countDocuments();
    
    // Orders today
    const ordersToday = await Order.countDocuments({ 
      createdAt: { $gte: startOfToday } 
    });
    
    // Orders this month
    const ordersThisMonth = await Order.countDocuments({ 
      createdAt: { $gte: startOfMonth } 
    });
    
    // Orders last month
    const ordersLastMonth = await Order.countDocuments({ 
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
    });
    
    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          total: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    // Revenue stats
    const totalRevenue = await Order.aggregate([
      {
        $match: { 
          orderStatus: { $nin: ['cancelled', 'refunded'] } 
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    const revenueThisMonth = await Order.aggregate([
      {
        $match: { 
          createdAt: { $gte: startOfMonth },
          orderStatus: { $nin: ['cancelled', 'refunded'] } 
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    const revenueLastMonth = await Order.aggregate([
      {
        $match: { 
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          orderStatus: { $nin: ['cancelled', 'refunded'] } 
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);

    res.json({
      orders: {
        total: totalOrders,
        today: ordersToday,
        thisMonth: ordersThisMonth,
        lastMonth: ordersLastMonth,
        byStatus: ordersByStatus
      },
      revenue: {
        total: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        thisMonth: revenueThisMonth.length > 0 ? revenueThisMonth[0].total : 0,
        lastMonth: revenueLastMonth.length > 0 ? revenueLastMonth[0].total : 0
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching order statistics', 
      details: error.message 
    });
  }
};

module.exports = controllers;