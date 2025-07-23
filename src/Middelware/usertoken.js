const jwt = require('jsonwebtoken')
const User = require('../Models/User')
const usertokencheck = async (req , res , next )=>{
try{
 const token  = req.cookies.token
  if(!token) {
      return res.status(401).json({ message :"Token not found."});
  }
  const  data = jwt.verify(token , process.env.JWT_CODE)

  const user = await User.findById(data.id)
  if (!user) {
      return res.status(400).json({ message : "Unauthorized: User not found."});
    }
     req.user = user;
     next()
}
catch(error){
     console.log(error)
         res.status(500).json({
            message: ' login to user account...!',
            error:error.message
        })
}
}

module.exports = usertokencheck