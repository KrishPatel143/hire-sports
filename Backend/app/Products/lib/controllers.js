const Product = require('../../../models/Products/Product');

const controllers = {};

controllers.getProduct = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      minPrice, 
      maxPrice, 
      search,
      sortBy = 'newest',
      showInactive
    } = req.query;

    const query = {};
    if (category && category !== 'all') query.category = category;
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      query.$text = { $search: search };
    }
    
    if (!showInactive) {
      query.isActive = true;
    }

    const sortOptions = {
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'name-asc': { name: 1 },
      'name-desc': { name: -1 },
      'rating-desc': { rating: -1 }
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

controllers.singleProduct = async (req, res) => {
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
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
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
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.productId },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ 
        error: true, 
        message: 'Product not found or you are not authorized to update' 
      });
    }

    res.json(updatedProduct);
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
    const deletedProduct = await Product.findOneAndDelete({ 
      _id: req.params.productId
    });
    
    if (!deletedProduct) {
      return res.status(404).json({ 
        error: true, 
        message: 'Product not found or you are not authorized to delete' 
      });
    }

    res.json({ 
      message: 'Product successfully deleted',
      deletedProduct 
    });
  } catch (error) {
    res.status(500).json({ 
      error: true, 
      message: 'Error deleting product', 
      details: error.message 
    });
  }
};

controllers.relatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ 
        error: true, 
        message: 'Product not found' 
      });
    }

    const relatedProducts = await Product.find({
      _id: { $ne: req.params.productId },
      category: product.category,
      isActive: true,
    })
      .limit(4)
      .sort({ createdAt: -1 });

    res.json(relatedProducts);
  } catch (error) {
    res.status(500).json({ 
      error: true, 
      message: 'Error fetching related products', 
      details: error.message 
    });
  }
};

controllers.reviewProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ 
        error: true, 
        message: 'Product not found' 
      });
    }

    const newReview = {
      userId: req.body.userId,
      name: req.body.name,
      rating: req.body.rating,
      comment: req.body.comment,
      date: new Date()
    };

    if (!product.reviews) {
      product.reviews = [];
    }
    
    product.reviews.push(newReview);
    
    product.rating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;
    product.reviewCount = product.reviews.length;
    
    await product.save();

    res.status(201).json({
      message: 'Review added successfully',
      review: newReview,
      rating: product.rating,
      reviewCount: product.reviewCount
    });
  } catch (error) {
    res.status(400).json({ 
      error: true, 
      message: 'Error adding review', 
      details: error.message 
    });
  }
};

controllers.searchProduct = async (req, res) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    const searchQuery = q ? { 
      $text: { $search: q } 
    } : {};

    const products = await Product.find(searchQuery)
      .sort({ score: { $meta: "textScore" } })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(searchQuery);

    res.json({
      totalProducts: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      products
    });
  } catch (error) {
    res.status(500).json({ 
      error: true, 
      message: 'Error searching products', 
      details: error.message 
    });
  }
};

module.exports = controllers;