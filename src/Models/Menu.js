const mongoose = require('mongoose');
const validator = require('validator');

const MenuSchema = new mongoose.Schema({
  RestaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'RestaurantId is required']
  },
  Itemsname: {
    type: String,
    required: [true, 'Itemsname is required'],
    trim: true
  },
  Description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  Category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [15, 'Category must be at most 15 characters']
  },
  Price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  Discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0
  },
  FinalPrice: {
    type: Number,
    min: [0, 'Final price cannot be negative']
  },
  Serves:{
    type:Number,
     min: [0, 'Serves  cannot be negative'],
     default:1

  },
  IsAvailable: {
    type: String,
    enum: {
      values: ['Available', 'NotAvailable'],
      message: 'IsAvailable must be "Available" or "NotAvailable"'
    },
    required: [true, 'IsAvailable is required']
  },
  Image: {
  type: String,
  required: [true, 'Image path is required'],
  validate: {
    validator: function(value) {
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      return validExtensions.some(ext => value.toLowerCase().endsWith(ext));
    },
    message: 'Image must end with a supported image extension (.jpg, .png, etc.)'
  }
},
  IsVeg: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// ✅ Only needed for create OR save:
MenuSchema.pre('save', function(next) {
  if (this.Category) {
    this.Category = this.Category.toLowerCase();
  }
  if (this.Price != null && this.Discount != null) {
    const discountAmount = (this.Price * this.Discount) / 100;
    this.FinalPrice = this.Price - discountAmount;
  }
  next();
});

module.exports = mongoose.model('Menu', MenuSchema);
