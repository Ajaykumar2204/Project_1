const express = require('express')
const Restaurantroutes = express.Router()
const usertokencheck = require('../Middelware/usertoken')
const Restaurant = require('../Models/Restaurant')

Restaurantroutes.post('/restaurant/register', usertokencheck, async (req, res) => {
  try {
    const userinfo = req.user;

    // ✅ Destructure correctly
    const { Restaurantname, ownername, Address, Phone , NumberOfTables} = req.body;

    // ✅ Validate Address block exists
    if (!Address) {
      return res.status(400).json({ message: 'Address is required.' });
    }

    // ✅ Destructure nested address fields
    const { area, city, state, country, PinCode   } = Address;

    // ✅ Validate all fields
    if (!Restaurantname || !ownername || !Phone || !area || !city || !state || !country || !PinCode || !NumberOfTables) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

  
    

    // ✅ Check for duplicate restaurant by same owner + same area
     const exists = await Restaurant.findOne({
      'Address.area': area,
      ownerId: userinfo._id,
    });

    if (exists) {
      return res.status(409).json({ message: 'Restaurant with this address already exists.' });
    }

    // ✅ Create the new restaurant
    const Restaurantinfo = new Restaurant({
      ownerId: userinfo._id,
      Restaurantname,
      ownername,
      Address: {
        area,
        city,
        state,
        country,
        PinCode,
      },
      Phone,
      NumberOfTables,
    });
    // ✅ Save to DB
    const Restaurantinfosave = await Restaurantinfo.save();

    res.status(200).json({
      message: 'Registration of Restaurant Done',
      Restaurant: Restaurantinfosave,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});


Restaurantroutes.get('/restaurant/view', usertokencheck, async (req, res) => {
  try {
    const userinfo = req.user;

    const Restaurantinfo = await Restaurant.findOne({ ownerId: userinfo._id });

    if (!Restaurantinfo) {
      return res.status(404).json({ message: 'No restaurant found.' });
    }

    res.status(200).json({
      message: 'Restaurant fetched successfully.',
      Restaurant: Restaurantinfo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});






module.exports = Restaurantroutes