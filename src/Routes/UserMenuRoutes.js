const express = require('express')
const { Model } = require('mongoose')
const UserMenuRoutes = express.Router()
const Restaurant = require('../Models/Restaurant')
const Menu = require('../Models/Menu')

UserMenuRoutes.get('/menu/view/:RestaurantId', async (req, res) => {
  try {
    const { RestaurantId } = req.params;

    if (!RestaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    const RestaurantFound = await Restaurant.findById(RestaurantId);
    if (!RestaurantFound) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
   
    const MenuInfo = await Menu.find({ RestaurantId: RestaurantId }).populate('RestaurantId' , 'Restaurantname  ownername  Phone  NumberOfTables');
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










module.exports = UserMenuRoutes