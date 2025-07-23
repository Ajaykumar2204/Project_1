const express = require('express')
const userroutes = express.Router()
const user = require('../Models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

userroutes.post('/signup' , async (req , res )=>{

   try{
     const { FullName , Email , Password ,  Phone } =  req.body 
    const email = Email.toLowerCase();
    if( !FullName   || !Email    || !Password   || !Phone ){
      return res.status(400).json({ message : 'All fields are required'} );
    }
   const existinguser = await user.find({ Email :  email } )
   if(!existinguser){
     return res.status(409).json({ message : 'user already exists'} );
   }
   
   const hashPassword = await bcrypt.hash(Password , 10 )

   const userinfo = new user({
    FullName ,
    Email : email,
    Password: hashPassword,
    Phone 
   }) 
     const token  = await userinfo.getjwt()
    res.cookie('token' , token  , { httpOnly :true})

   const userData =  await userinfo.save()
    res.status(200).json({ message : 'Sigup Done..' ,  user:userData })

   }catch(error){
     console.log(error)
     res.status(500).json({
         message: 'Internal Server Error',
         error : error.message
     })
   }
})

userroutes.post('/login' , async( req , res )=>{
    try{
        const { Email , Password } = req.body
        const email = Email.toLowerCase()

    const userinfo = await user.findOne({ Email : email })
      if(!userinfo){
        return res.status(404).json({ message : "User does not exist"});
      }
     const Passwordvalide  =  await userinfo.verify(Password) 
     if(!Passwordvalide){
       return res.status(404).json({ message : "Password will Incorrect"}); 
     }
    const token  = await userinfo.getjwt()
    res.cookie('token' , token  , { httpOnly :true})

    res.status(200).json({
        message:'login Done',
        user : userinfo
    })
    
    }catch(error){
        console.log(error)
        res.status(500).json({
            message: 'Internal Server Error',
            error:error.message
        })
    }
})

userroutes.post('/logout' , (req , res )=>{
    res.cookie( 'token' , ''  ,{
          expires: new Date(0),
           httpOnly: true,
     })
    res.status(200).json({ message : 'logout Done'}) 
})


module.exports = userroutes