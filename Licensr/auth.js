const express=require("express")
const router=express.Router();
const auth=require("../../middleware/auth")
const config =require("config")
const bcrypt=require("bcryptjs")
const jwt =require("jsonwebtoken")
const {check,validationResult}=require("express-validator")

const User=require("../../models/User")

//@route GET api/auth
//@desc  Test Route
//@access Public

router.get("/",auth,async(req,res) => {
    try {
        const user=await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (err) {
        console.error(err.message)
        res.status(500).send("server error")
    }
})

//@route POST api/auth
//@desc  Authenticate User and Get Token
//@access Public

router.post("/",[
    check("email","email is required").isEmail(),
    check("password","password is required").exists()
],async(req,res) => {
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    const {email,password}=req.body

    try {
        //to see if user is already registered
        var user= await User.findOne({email:email})

        if(!user){
            res.status(400).json({errors: [{msg:"invalid credentials"}]})
        }
       

        //comparing if the passwords match
        const isMatch= await bcrypt.compare(password,user.password)

        if(!isMatch){
            res.status(400).json({errors: [{msg:"invalid credentials"}]})
        }


       //return jsonwebtoken
        const payload={
            user:{
                id:user.id
            }
        }

        jwt.sign(payload,config.get("jwtSecret"),{expiresIn:360000},function(err,token){
            if(err) throw error
            res.json({token})
        })

        console.log(req.body)
        // res.send("user registered")
        
    } catch (err) {
        console.error(err.message)
        res.status(500).send("server error")
    }
    
})

module.exports= router;