const express = require('express')
const app = express()
const DataBaseConnection = require('./Config/Database');
const cookieparser = require('cookie-parser')
const path = require('path');
require('dotenv').config()
const cors = require('cors')

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

const userroutes = require('./Routes/UserRoutes')
const Restaurantroutes = require('./Routes/RestaurantRoutes')
const MenuRoutes = require('./Routes/MenuRoutes')
const UserMenuRoutes = require('./Routes/UserMenuRoutes')
const OrderRoutes = require('./Routes/OrderRoutes')
const FinalRoutes = require('./Routes/FinalRoutes')

app.use(cors({
     origin:"http://localhost:5173",
     credentials:true
}))


app.use(express.json())
app.use(cookieparser())
app.use('/' , userroutes)
app.use('/' ,Restaurantroutes)
app.use('/' , MenuRoutes )
app.use('/' , UserMenuRoutes )
app.use('/' , OrderRoutes)
 app.use('/' , FinalRoutes)

     // ✅ Serve your React build static files
app.use(express.static(path.join(__dirname, 'build')));

// ✅ Fallback for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});





DataBaseConnection()
.then(()=>{
    console.log('✅ Database Connection Done...');
    app.listen( 3000 , ()=>{
    console.log('🚀 App is listening on Port 3000...');
    })
})
.catch((err) => {
    console.error("❌ Database connection failed:", err.message);
 });


