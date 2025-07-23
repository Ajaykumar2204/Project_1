const { string } = require("i/lib/util");
const  mongoose  = require("mongoose");
const validator = require('validator')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const userschema =  mongoose.Schema({

    FullName:{
        type:String,
        required: [true , "Full name is required" ],
        trim : true,
        minlength: [3, "Full name must be at least 3 characters"],
        maxlength: [50, "Full name must be at most 50 characters"]
    },
     Email: {
        type: String,
        required:[true , "Email is required" ],
        unique: true,
        trim: true,
        lowercase : true , 
        validate: {
            validator: validator.isEmail,
             message : "Invalid email address",
         }
     },
     Password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
       minlength: [8, "Password must be at least 8 characters"],
       validate :{
          validator:validator.isStrongPassword,
          message: "Password must include uppercase, lowercase, number, symbol",
       }
     },
     Phone:{
        type:String,
        require: [true , "Phone will be require"],
        trim : true,
        validate:{
            validator:function(value){
               return  validator.isMobilePhone(value , "en-IN" )
            },
            message: "Invalid phone number"
        }
     }
},{
    timestamps: true 
})
userschema.methods.verify = async function(Password){
   const validation =   await bcrypt.compare( Password , this.Password)
   return validation
}

userschema.methods.getjwt = async function () {
     const token = await  jwt.sign({ id : this._id} , process.env.JWT_CODE)
     return token
}


const userData = mongoose.model( "user" , userschema)

module.exports = userData