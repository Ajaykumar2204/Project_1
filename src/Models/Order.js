// src/Models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  RestaurantId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  tableNumber: {
    type: Number,
    required: true,
  },
  Note: {
    type: String,
  },
  items: [
    {
      menuItemId: {
        type: String,
      },
      itemName: {
        type: String,
      },
      price: {
        type: Number,
      },
      quantity: {
        type: Number,
      },
      image: {
        type: String,
      },
    },
  ],
  cookingStatus: {
    type: String,
    enum: ['cooking', 'completed'],
    default: 'cooking',
  },

  // Track how the customer paid
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Online'],
    required: true,
  },

  // Track whether payment has been received
  paymentStatuscheck : {
    type: String,
    enum: ['Pending', 'Paid'],

  },


  total: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
} ,{
    timestamps: true
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;