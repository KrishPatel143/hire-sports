const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  name: {
    type: String,
    required: true
  },
  size: String,
  color: String
});

const ShippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  addressLine1: {
    type: String,
    required: true
  },

  state: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  }
});
const PaymentDetailsSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    enum: ['creditCard', 'paypal', 'stripe', 'cod', 'bankTransfer']
  },
  // Credit Card details
  cardNumber: {
    type: String,
    // Only store last 4 digits for security
    validate: {
      validator: function(v) {
        return this.method !== 'creditCard' || (v && v.length >= 4);
      },
      message: 'Card number is required for credit card payments'
    }
  },
  cardHolderName: String,
  expiryDate: String,
  last4Digits: String,
  
  // PayPal details
  paypalEmail: String,
  paypalTransactionId: String,
  
  // Bank Transfer details
  bankName: String,
  accountNumber: String,
  transactionId: String,
  
  // COD details
  codVerificationCode: String
});

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [OrderItemSchema],
  shippingAddress: ShippingAddressSchema,

  // Replace paymentMethod with paymentDetails
  paymentDetails: PaymentDetailsSchema,
  
  // Keep this for compatibility with payment processors
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    min: 0
  },
  shippingPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  taxPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPrice: {
    type: Number,
    min: 0
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  trackingNumber: String,
  notes: String,
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date,
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Methods to calculate totals
OrderSchema.methods.calculateItemsPrice = function() {
  return this.orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
};

OrderSchema.methods.calculateTotalPrice = function() {
  return this.itemsPrice + this.shippingPrice + this.taxPrice;
};

// Pre-save middleware to update totals
OrderSchema.pre('save', function(next) {
  if (this.isModified('orderItems') || this.isNew) {
    this.itemsPrice = this.calculateItemsPrice();
    this.totalPrice = this.calculateTotalPrice();
  }
  this.updatedAt = Date.now();
  next();
});

// Virtual for order age in days
OrderSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for whether order can be cancelled (e.g., only if not shipped)
OrderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'processing'].includes(this.orderStatus);
});

// Index for faster lookups
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);