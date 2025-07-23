const express = require('express');
const FinalRoutes = express.Router();
const usertokencheck = require('../Middelware/usertoken');
const Orders = require('../Models/Order');
const  Restaurant = require('../Models/Restaurant')
FinalRoutes.get('/orders/:RestaurantId', usertokencheck, async (req, res) => {
  try {
    const { RestaurantId } = req.params;

    const check = await Restaurant.find({ _id: RestaurantId });

    if (check.length === 0) {
      return res.status(404).json({ message: 'No Restaurant Found' });
    }

    // Get current date/time in UTC
    const now = new Date();

    // "Today" at 7 AM UTC
    const start = new Date();
    start.setUTCHours(7, 0, 0, 0);

    // If it's before 7 AM UTC now, shift start to yesterday 7 AM
    if (now < start) {
      start.setUTCDate(start.getUTCDate() - 1);
    }

    // "Tomorrow" at 7 AM UTC
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 1);

    const data = await Orders.find({
      RestaurantId: RestaurantId,
      paymentStatuscheck: "Paid",
      paymentMethod: { $in: ["Online", "Cash"] },
      updatedAt: { $gte: start, $lt: end }
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});
FinalRoutes.get('/orders/:RestaurantId/by-date/:date', usertokencheck, async (req, res) => {
  try {
    const { RestaurantId, date } = req.params;

    const check = await Restaurant.findById(RestaurantId);
    if (!check) {
      return res.status(404).json({ message: 'No Restaurant Found' });
    }

    const start = new Date(date);
    start.setUTCHours(7, 0, 0, 0);

    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 1);

    // console.log(`Date input window: ${start.toISOString()} - ${end.toISOString()}`);

    const data = await Orders.find({
      RestaurantId,
      paymentStatuscheck: "Paid",
      paymentMethod: { $in: ["Online", "Cash"] },
      updatedAt: { $gte: start, $lt: end },
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching orders by date:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


module.exports = FinalRoutes;
