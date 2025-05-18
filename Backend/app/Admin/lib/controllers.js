const Admin = require('../../../models/User/Admin');
const Product = require('../../../models/Products/Product');
const Order = require('../../../models/Order/Order');
const User = require('../../../models/User/User');
const mongoose = require('mongoose');
const Category = require('../../../models/Products/Category');

const controllers = {};

// Dashboard Statistics
controllers.getDashboardStats = async (req, res) => {
  try {
    // Time periods for statistics
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get order statistics
    const orderStats = await Order.aggregate([
      {
        $facet: {
          "total": [{ $count: "count" }],
          "todayOrders": [
            { $match: { createdAt: { $gte: startOfToday } } },
            { $count: "count" }
          ],
          "weekOrders": [
            { $match: { createdAt: { $gte: startOfWeek } } },
            { $count: "count" }
          ],
          "monthOrders": [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $count: "count" }
          ],
          "byStatus": [
            { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
          ],
          "revenue": [
            {
              $match: {
                orderStatus: { $nin: ['cancelled', 'refunded'] }
              }
            },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
          ],
          "todayRevenue": [
            {
              $match: {
                createdAt: { $gte: startOfToday },
                orderStatus: { $nin: ['cancelled', 'refunded'] }
              }
            },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
          ],
          "weekRevenue": [
            {
              $match: {
                createdAt: { $gte: startOfWeek },
                orderStatus: { $nin: ['cancelled', 'refunded'] }
              }
            },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
          ],
          "monthRevenue": [
            {
              $match: {
                createdAt: { $gte: startOfMonth },
                orderStatus: { $nin: ['cancelled', 'refunded'] }
              }
            },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
          ],
          "lastMonthRevenue": [
            {
              $match: {
                createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
                orderStatus: { $nin: ['cancelled', 'refunded'] }
              }
            },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
          ]
        }
      }
    ]);

    // Get product statistics
    const productStats = await Product.aggregate([
      {
        $facet: {
          "total": [{ $count: "count" }],
          "active": [
            { $match: { isActive: true } },
            { $count: "count" }
          ],
          "inactive": [
            { $match: { isActive: false } },
            { $count: "count" }
          ],
          "outOfStock": [
            { $match: { stock: { $lte: 0 } } },
            { $count: "count" }
          ],
          "lowStock": [
            { $match: { stock: { $gt: 0, $lte: 5 } } },
            { $count: "count" }
          ],
          "byCategory": [
            { $group: { _id: "$category", count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $facet: {
          "total": [{ $count: "count" }],
          "today": [
            { $match: { createdAt: { $gte: startOfToday } } },
            { $count: "count" }
          ],
          "thisMonth": [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $count: "count" }
          ],
          "lastMonth": [
            { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $count: "count" }
          ]
        }
      }
    ]);

    // Get latest orders (limited to 5)
    const latestOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $match: { orderStatus: { $nin: ['cancelled', 'refunded'] } } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          productName: { $first: "$orderItems.name" },
          totalSold: { $sum: "$orderItems.quantity" },
          totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // Prepare response
    const responseData = {
      orders: {
        total: orderStats[0].total[0]?.count || 0,
        today: orderStats[0].todayOrders[0]?.count || 0,
        thisWeek: orderStats[0].weekOrders[0]?.count || 0,
        thisMonth: orderStats[0].monthOrders[0]?.count || 0,
        byStatus: orderStats[0].byStatus || []
      },
      products: {
        total: productStats[0].total[0]?.count || 0,
        active: productStats[0].active[0]?.count || 0,
        inactive: productStats[0].inactive[0]?.count || 0,
        outOfStock: productStats[0].outOfStock[0]?.count || 0,
        lowStock: productStats[0].lowStock[0]?.count || 0,
        byCategory: productStats[0].byCategory || []
      },
      users: {
        total: userStats[0].total[0]?.count || 0,
        newToday: userStats[0].today[0]?.count || 0,
        newThisMonth: userStats[0].thisMonth[0]?.count || 0,
        newLastMonth: userStats[0].lastMonth[0]?.count || 0
      },
      revenue: {
        total: orderStats[0].revenue[0]?.total || 0,
        today: orderStats[0].todayRevenue[0]?.total || 0,
        thisWeek: orderStats[0].weekRevenue[0]?.total || 0,
        thisMonth: orderStats[0].monthRevenue[0]?.total || 0,
        lastMonth: orderStats[0].lastMonthRevenue[0]?.total || 0,
        growth: orderStats[0].monthRevenue[0]?.total && orderStats[0].lastMonthRevenue[0]?.total ?
          ((orderStats[0].monthRevenue[0].total - orderStats[0].lastMonthRevenue[0].total) /
            orderStats[0].lastMonthRevenue[0].total * 100).toFixed(2) : 0
      },
      latestOrders,
      topProducts
    };

    res.json(responseData);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error fetching dashboard statistics',
      details: error.message
    });
  }
};

// Admin Management (SuperAdmin Only)
controllers.getAllAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const admins = await Admin.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Admin.countDocuments(query);

    res.json({
      totalAdmins: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      admins
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error fetching admins',
      details: error.message
    });
  }
};

controllers.createAdmin = async (req, res) => {
  try {
    // Check if email already exists
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
      role: req.body.role || 'admin'
    });

    // Save admin to database
    const savedAdmin = await newAdmin.save();

    // Return admin data (excluding password)
    const adminData = savedAdmin.toObject();
    delete adminData.password;

    res.status(201).json({
      message: 'Admin created successfully',
      admin: adminData
    });
  } catch (error) {
    res.status(400).json({
      error: true,
      message: 'Error creating admin',
      details: error.message
    });
  }
};

controllers.getAdminDetails = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.adminId)
      .select('-password');

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
      message: 'Error fetching admin details',
      details: error.message
    });
  }
};

controllers.updateAdmin = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const admin = await Admin.findById(req.params.adminId);

    if (!admin) {
      return res.status(404).json({
        error: true,
        message: 'Admin not found'
      });
    }

    // Update fields
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (role) admin.role = role;

    const updatedAdmin = await admin.save();

    res.json({
      message: 'Admin updated successfully',
      admin: {
        _id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        isActive: updatedAdmin.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error updating admin',
      details: error.message
    });
  }
};

controllers.toggleAdminStatus = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.adminId);

    if (!admin) {
      return res.status(404).json({
        error: true,
        message: 'Admin not found'
      });
    }

    // Toggle isActive status
    admin.isActive = !admin.isActive;
    const updatedAdmin = await admin.save();

    res.json({
      message: `Admin ${updatedAdmin.isActive ? 'activated' : 'deactivated'} successfully`,
      admin: {
        _id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        isActive: updatedAdmin.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error toggling admin status',
      details: error.message
    });
  }
};

// Product Management
controllers.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      sortBy = 'newest',
      minPrice,
      maxPrice,
      inStock
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    } else if (inStock === 'false') {
      query.stock = { $lte: 0 };
    }

    const sortOptions = {
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 },
      'price-high': { price: -1 },
      'price-low': { price: 1 },
      'name-asc': { name: 1 },
      'name-desc': { name: -1 }
    };

    const products = await Product.find(query)
      .sort(sortOptions[sortBy] || sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      totalProducts: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      products
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error fetching products',
      details: error.message
    });
  }
};

controllers.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      sortBy = 'newest',
      minPrice,
      maxPrice,
      inStock,
      isActive // ✅ NEW: filter by isActive true/false
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    } else if (inStock === 'false') {
      query.stock = { $lte: 0 };
    }

    // ✅ isActive filter
    if (isActive === 'true') {
      query.isActive = true;
    } else if (isActive === 'false') {
      query.isActive = false;
    }
    // If isActive is undefined → no filter → includes both active & inactive

    // Sort options
    const sortOptions = {
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 },
      'price-high': { price: -1 },
      'price-low': { price: 1 },
      'name-asc': { name: 1 },
      'name-desc': { name: -1 }
    };

    const products = await Product.find(query)
      .sort(sortOptions[sortBy] || sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      totalProducts: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      products
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Failed to fetch all products (admin)',
      details: error.message
    });
  }
};




controllers.getProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        error: true,
        message: 'Product not found'
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error fetching product details',
      details: error.message
    });
  }
};

controllers.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      images,
      specifications,
      isActive = true
    } = req.body;

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      stock,
      images,
      specifications,
      isActive
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: 'Product created successfully',
      product: savedProduct
    });
  } catch (error) {
    res.status(400).json({
      error: true,
      message: 'Error creating product',
      details: error.message
    });
  }
};

controllers.updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      images,
      specifications,
      isActive
    } = req.body;

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        error: true,
        message: 'Product not found'
      });
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (images) product.images = images;
    if (specifications) product.specifications = specifications;
    if (isActive !== undefined) product.isActive = isActive;

    const updatedProduct = await product.save();

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    res.status(400).json({
      error: true,
      message: 'Error updating product',
      details: error.message
    });
  }
};

controllers.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        error: true,
        message: 'Product not found'
      });
    }

    await product.remove();

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error deleting product',
      details: error.message
    });
  }
};

controllers.toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        error: true,
        message: 'Product not found'
      });
    }

    product.isActive = !product.isActive;
    const updatedProduct = await product.save();

    res.json({
      message: `Product ${updatedProduct.isActive ? 'activated' : 'deactivated'} successfully`,
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error toggling product status',
      details: error.message
    });
  }
};

controllers.bulkImportProducts = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'No products provided for import'
      });
    }

    const importedProducts = await Product.insertMany(products);

    res.status(201).json({
      message: `${importedProducts.length} products imported successfully`,
      products: importedProducts
    });
  } catch (error) {
    res.status(400).json({
      error: true,
      message: 'Error importing products',
      details: error.message
    });
  }
};

controllers.bulkUpdateProducts = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'No updates provided'
      });
    }

    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update.productId },
        update: { $set: update.fields }
      }
    }));

    const result = await Product.bulkWrite(bulkOps);

    res.json({
      message: 'Products updated successfully',
      result
    });
  } catch (error) {
    res.status(400).json({
      error: true,
      message: 'Error updating products',
      details: error.message
    });
  }
};

// Order Management
controllers.getOrders = async (req, res) => {
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

controllers.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email')
      .populate({
        path: 'orderItems.product',
        select: 'name image isActive stock'
      });

    if (!order) {
      return res.status(404).json({
        error: true,
        message: 'Order not found'
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

// User Management
controllers.getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'newest',
      startDate,
      endDate,
      isActive
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1); // Include the end date
        query.createdAt.$lt = endDateObj;
      }
    }

    // Active status filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const sortOptions = {
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 },
      'name-asc': { name: 1 },
      'name-desc': { name: -1 }
    };

    const users = await User.find(query)
      .select('-password')
      .sort(sortOptions[sortBy] || sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      totalUsers: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      users
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error fetching users',
      details: error.message
    });
  }
};

controllers.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error fetching user details',
      details: error.message
    });
  }
};

controllers.updateUser = async (req, res) => {
  try {
    const { name, email, isActive } = req.body;

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (isActive !== undefined) user.isActive = isActive;

    const updatedUser = await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isActive: updatedUser.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error updating user',
      details: error.message
    });
  }
};

controllers.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    const updatedUser = await user.save();

    res.json({
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isActive: updatedUser.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error toggling user status',
      details: error.message
    });
  }
};

// Category Management
controllers.getCategories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'name-asc',
      isActive
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Active status filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const sortOptions = {
      'name-asc': { name: 1 },
      'name-desc': { name: -1 },
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 }
    };

    const categories = await Category.find(query)
      .sort(sortOptions[sortBy] || sortOptions['name-asc'])
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Category.countDocuments(query);

    res.json({
      totalCategories: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      categories
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error fetching categories',
      details: error.message
    });
  }
};

controllers.createCategory = async (req, res) => {
  try {
    const { name, description, isActive = true } = req.body;

    // Check if category with same name exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({
        error: true,
        message: 'Category with this name already exists'
      });
    }

    const newCategory = new Category({
      name,
      description,
      isActive
    });

    const savedCategory = await newCategory.save();

    res.status(201).json({
      message: 'Category created successfully',
      category: savedCategory
    });
  } catch (error) {
    res.status(400).json({
      error: true,
      message: 'Error creating category',
      details: error.message
    });
  }
};

controllers.updateCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    const category = await Category.findById(req.params.categoryId);

    if (!category) {
      return res.status(404).json({
        error: true,
        message: 'Category not found'
      });
    }

    // Check if new name conflicts with existing category
    if (name && name.toLowerCase() !== category.name.toLowerCase()) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      });

      if (existingCategory) {
        return res.status(400).json({
          error: true,
          message: 'Category with this name already exists'
        });
      }
    }

    // Update fields
    if (name) category.name = name;
    if (description) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    const updatedCategory = await category.save();

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    res.status(400).json({
      error: true,
      message: 'Error updating category',
      details: error.message
    });
  }
};

controllers.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);

    if (!category) {
      return res.status(404).json({
        error: true,
        message: 'Category not found'
      });
    }

    // Check if category is in use
    const productsCount = await Product.countDocuments({ category: category._id });
    if (productsCount > 0) {
      return res.status(400).json({
        error: true,
        message: 'Cannot delete category that is in use by products'
      });
    }

    await category.remove();

    res.json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Error deleting category',
      details: error.message
    });
  }
};

module.exports = controllers;