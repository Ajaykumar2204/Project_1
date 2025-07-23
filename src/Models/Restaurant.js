const mongoose = require('mongoose');
const validator = require('validator');

const RestaurantSchema = mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true, // ✅ fixed typo
  },
  Restaurantname: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, "Restaurant name must be at least 3 characters"],
    maxlength: [50, "Restaurant name must be at most 50 characters"],
  },
  ownername: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, "Owner name must be at least 3 characters"],
    maxlength: [50, "Owner name must be at most 50 characters"],
  },
  Address: {
    area: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [5, "Address must be at least 10 characters"],
      maxlength: [120, "Address must be at most 120 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      lowercase: true,
    },
    state: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "State is required"], // ✅ made required
    },
    country: {
      type: String,
      trim: true,
      lowercase: true,
      default: "india",
    },
    PinCode: {
      type: String,
      trim: true,
      required: [true, "PIN code is required"],
      validate: {
        validator: function (v) {
          return /^[1-9][0-9]{5}$/.test(v);
        },
        message: "PIN code must be a valid 6-digit number",
      },
    },
  },
  Phone: {
    type: String,
    required: [true, "Phone is required"],
    trim: true,
    validate: {
      validator: function (value) {
        return validator.isMobilePhone(value, "en-IN");
      },
      message: "Invalid phone number",
    },
  },
  NumberOfTables: {
    type: Number,
    required: true,
    min: [1, "Number of tables must be at least 1"],
  },
}, {
  timestamps: true,
});

// ✅ Unique index: same ownerId cannot register same area twice
RestaurantSchema.index({ 'Address.area': 1, ownerId: 1 }, { unique: true });

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

module.exports = Restaurant;



