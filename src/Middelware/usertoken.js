// const jwt = require('jsonwebtoken')
// const User = require('../Models/User')

// const usertokencheck = async (req , res , next )=>{
// try{
//  const token  = req.cookies.token
//   if(!token) {
//       return res.status(401).json({ message :"Token not found."});
//   }
//   const  data = jwt.verify(token , process.env.JWT_CODE)

//   const user = await User.findById(data.id)
//   if (!user) {
//       return res.status(400).json({ message : "Unauthorized: User not found."});
//     }
//      req.user = user;
//      next()
// }
// catch(error){
//      console.log(error)
//          res.status(500).json({
//             message: ' login to user account...!',
//             error:error.message
//         })
// }
// }

// module.exports = usertokencheck
const jwt = require('jsonwebtoken')
const User = require('../Models/User')
const mongoose = require('mongoose'); // <-- IMPORTANT: Add this line if not already there

const usertokencheck = async (req , res , next )=>{
try{
 const token  = req.cookies.token
  console.log('usertokencheck: Token received:', token ? 'Exists' : 'No Token'); // Debug token presence

  if(!token) {
      console.log('usertokencheck: No token found, returning 401');
      return res.status(401).json({ message :"Token not found."});
  }

  const  data = jwt.verify(token , process.env.JWT_CODE)
  console.log('usertokencheck: JWT Decoded Data:', data); // CRITICAL: What is the 'data' object?
  console.log('usertokencheck: JWT Decoded Data ID (data.id):', data.id); // CRITICAL: What is the value of 'data.id'?

  // Add a check to ensure data.id is a valid ObjectId format BEFORE passing to findById
  if (!data.id || !mongoose.Types.ObjectId.isValid(data.id)) {
      console.error('usertokencheck: Invalid or missing ID in JWT payload:', data.id);
      return res.status(401).json({ message: "Unauthorized: Invalid user ID in token." });
  }

  const user = await User.findById(data.id)
  console.log('usertokencheck: User found by ID:', user ? user._id : 'Not Found'); // See if user is found

  if (!user) {
      console.log('usertokencheck: User not found for ID, returning 400');
      return res.status(400).json({ message : "Unauthorized: User not found."});
    }

 req.user = user;
 console.log('usertokencheck: req.user assigned (user._id):', req.user._id); // See what's attached to req.user
 next()
}
catch(error){
     console.error('usertokencheck Error (caught in catch block):', error); // Log the actual error that's caught
         res.status(500).json({
            message: ' login to user account...!', // This message is misleading for token errors
            error:error.message
        })
}
}

module.exports = usertokencheck