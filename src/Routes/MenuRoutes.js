const usertokencheck = require('../Middelware/usertoken');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const MenuRoutes = express.Router();

// ✅ Your Mongoose Models
const Menu = require('../Models/Menu');
const Restaurant = require('../Models/Restaurant');

// ✅ Base uploads directory
const baseUploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// ✅ Multer Storage with dynamic folder — works for both Add & Update
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const RestaurantId = req.params.RestaurantId || req.body.RestaurantId;

    if (!RestaurantId) {
      return cb(new Error('RestaurantId is required to create folder'), null);
    }

    const restaurantDir = path.join(baseUploadDir, RestaurantId);

    if (!fs.existsSync(restaurantDir)) {
      fs.mkdirSync(restaurantDir, { recursive: true });
    }

    cb(null, restaurantDir);
  },

  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });


// ✅ ✅ ADD MENU ITEM
MenuRoutes.post(
  '/menu/ItemsAdd',
  upload.single('Image'),
  usertokencheck,
  async (req, res) => {
    try {
      const {
        RestaurantId,
        Itemsname,
        Description,
        Category,
        Price,
        Serves,
        Discount,
        IsAvailable,
        IsVeg,
      } = req.body;

      if (!req.file || !req.file.filename) {
        return res.status(400).json({ message: 'Upload the Image' });
      }

      const priceNum = parseFloat(Price);
      const discountNum = parseFloat(Discount);
      const servesNum = parseInt(Serves);

      if (isNaN(priceNum) || isNaN(discountNum) || isNaN(servesNum)) {
        return res.status(400).json({
          message: 'Price, Discount, and Serves must be valid numbers',
        });
      }

      if (!['Available', 'NotAvailable'].includes(IsAvailable)) {
        return res.status(400).json({
          message: 'IsAvailable must be "Available" or "NotAvailable"',
        });
      }

      if (IsVeg !== 'true' && IsVeg !== 'false') {
        return res.status(400).json({
          message: 'IsVeg must be true or false',
        });
      }

      const isVegBool = IsVeg === 'true';

      const Restaurantinfo = await Restaurant.findById(RestaurantId);
      if (!Restaurantinfo) {
        return res.status(404).json({ message: 'No Restaurant found' });
      }

      const imagePath = `/uploads/${RestaurantId}/${req.file.filename}`;

      const iteminfo = new Menu({
        RestaurantId,
        Itemsname,
        Description,
        Category,
        Price: priceNum,
        Discount: discountNum,
        Serves: servesNum,
        IsAvailable,
        Image: imagePath,
        IsVeg: isVegBool,
      });

      const ItemsSave = await iteminfo.save();

      res.status(200).json({
        message: 'Item saved to menu',
        item: ItemsSave,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Internal Server Error',
        error: error.message || error,
      });
    }
  }
);

// ✅ ✅ VIEW MENU ITEMS
MenuRoutes.get('/menu/view/edit/:RestaurantId', usertokencheck, async (req, res) => {
  try {
    const { RestaurantId } = req.params;

    if (!RestaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    const RestaurantFound = await Restaurant.findById(RestaurantId);
    if (!RestaurantFound) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const MenuInfo = await Menu.find({ RestaurantId: RestaurantId });
    if (!MenuInfo || MenuInfo.length === 0) {
      return res.status(404).json({ message: 'Restaurant menu not found' });
    }

    res.status(200).json({
      message: 'Restaurant menu found',
      items: MenuInfo
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message || error });
  }
});

// ✅ ✅ DELETE MENU ITEM
MenuRoutes.delete('/menu/item/Delete/:RestaurantId/:itemId', usertokencheck, async (req, res) => {
  const { RestaurantId, itemId } = req.params;

  if (!RestaurantId || !itemId) {
    return res.status(400).json({ message: 'RestaurantId or itemId is missing' });
  }

  try {
    const item = await Menu.findOneAndDelete({
      _id: itemId,
      RestaurantId: RestaurantId
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item deleted successfully', item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ ✅ UPDATE MENU ITEM
MenuRoutes.put(
  '/menu/item/Update/:RestaurantId/:itemId',
  upload.single('Image'),
  usertokencheck,
  async (req, res) => {
    const { RestaurantId, itemId } = req.params;

    if (!RestaurantId || !itemId) {
      return res.status(400).json({ message: 'RestaurantId and itemId are required' });
    }

    try {
      const item = await Menu.findOne({ _id: itemId, RestaurantId: RestaurantId });
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      const {
        Itemsname,
        Description,
        Category,
        Price,
        Serves,
        Discount,
        IsAvailable,
        IsVeg
      } = req.body;

      if (Price && isNaN(parseFloat(Price))) {
        return res.status(400).json({ message: 'Price must be a valid number' });
      }

      if (Discount && isNaN(parseFloat(Discount))) {
        return res.status(400).json({ message: 'Discount must be a valid number' });
      }

      if (Serves && isNaN(parseInt(Serves))) {
        return res.status(400).json({ message: 'Serves must be a valid number' });
      }

      if (IsAvailable && !['Available', 'NotAvailable'].includes(IsAvailable)) {
        return res.status(400).json({ message: 'IsAvailable must be "Available" or "NotAvailable"' });
      }

      if (IsVeg && !(IsVeg === 'true' || IsVeg === 'false')) {
        return res.status(400).json({ message: 'IsVeg must be true or false' });
      }

      if (Itemsname) item.Itemsname = Itemsname;
      if (Description) item.Description = Description;
      if (Category) item.Category = Category;
      if (Price) item.Price = parseFloat(Price);
      if (Discount) item.Discount = parseFloat(Discount);
      if (Serves) item.Serves = parseInt(Serves);
      if (IsAvailable) item.IsAvailable = IsAvailable;
      if (IsVeg) item.IsVeg = IsVeg === 'true';

      if (req.file) {
        const oldImagePath = path.join(__dirname, '..', item.Image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }

        const newImagePath = `/uploads/${RestaurantId}/${req.file.filename}`;
        item.Image = newImagePath;
      }

      const updatedItem = await item.save();

      res.status(200).json({
        message: 'Item updated successfully',
        item: updatedItem
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

module.exports = MenuRoutes;

