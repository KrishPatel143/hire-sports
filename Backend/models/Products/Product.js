const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  longDescription: {
    type: String
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  compareAtPrice: {
    type: Number,
    min: [0, 'Compare at price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    index: true
  },
  tags: {
    type: [String],
    index: true
  },
  image: {
    type: String
  },
  images: {
    type: [String]
  },
  sizes: {
    type: [String]
  },
  colors: {
    type: [String]
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  reviews: [reviewSchema],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add text index for search
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Auto-generate SKU if not provided
ProductSchema.pre('save', async function(next) {
  if (!this.sku) {
    this.sku = `SKU-${this._id.toString().slice(-6).toUpperCase()}`;
  }
  next();
});

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round((1 - this.price / this.compareAtPrice) * 100);
  }
  return 0;
});

// Method to check if product is in stock
ProductSchema.methods.isInStock = function() {
  return this.stock > 0;
};

// Method to check if product is on sale
ProductSchema.methods.isOnSale = function() {
  return this.compareAtPrice && this.compareAtPrice > this.price;
};

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);