const express = require('express')
const OrderRoutes = express.Router()
const usertokencheck = require('../Middelware/usertoken')
const Menu = require('../Models/Menu')
const  Order=  require('../Models/Order')



OrderRoutes.post('/menu/view/:RestaurantId/cart', usertokencheck , async(req , res)=>{
     try {
    const { RestaurantId } = req.params;
    const { orderData } = req.body;

    if (!orderData) {
      return res.status(400).json({ message: 'orderData is required.' });
    }

    const { customerInfo, cartItems, paymentStatus, total } = orderData;

    if (!customerInfo?.name || !customerInfo?.phone || !customerInfo?.tableNumber) {
      return res.status(400).json({ message: 'Customer name, phone, and tableNumber are required.' });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart must have at least one item.' });
    }

    for (const item of cartItems) {
      if (!item._id || !item.quantity || !item.Price) {
        return res.status(400).json({ message: 'Each cart item must have _id, quantity, and Price.' });
      }

      const menuItem = await Menu.findById(item._id);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item with ID ${item._id} not found.` });
      }
    }
     let check = ''
    if(paymentStatus === "Online"){
       check  = 'Paid'
    }
    else{
       check  = 'Pending'
    }



    const newOrder = new Order({
      RestaurantId,
      name: customerInfo.name,
      phone: customerInfo.phone,
      tableNumber: customerInfo.tableNumber,
      Note: customerInfo.Note || '',
      items: cartItems.map(item => ({
        menuItemId: item._id,
        itemName: item.Itemsname,
        price: item.Price,
        quantity: item.quantity,
        image: item.Image || '',
      })),
      paymentMethod : paymentStatus , 
       paymentStatuscheck : check ,
      total: total || 0,
      createdAt: new Date(),
    });

    const data = await newOrder.save();

    res.status(201).json({
      message: 'Order placed successfully.',
      order: data,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


OrderRoutes.get('/menu/:RestaurantId/orders/view', usertokencheck , async (req, res) => {
  const { RestaurantId } = req.params;

  if (!RestaurantId) {
    return res.status(400).json({ message: 'RestaurantId is required in params.' });
  }

  try {
    const orders = await Order.find({ RestaurantId }).sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Orders fetched successfully.',
      count: orders.length,
      orders,
    });

  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
})

// ✅ Update order's cookingStatus and paymentStatuscheck
OrderRoutes.post('/menu/:RestaurantId/orders/view/:id/:cookingStatus/:paymentStatus', async (req, res) => {
  const { id, cookingStatus, paymentStatus } = req.params;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        $set: {
          cookingStatus: cookingStatus,
          paymentStatuscheck: paymentStatus,
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      order: updatedOrder,
      message: 'Order updated successfully!',
    });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ error: 'Server error updating order' });
  }
});

module.exports = OrderRoutes;


















module.exports = OrderRoutes