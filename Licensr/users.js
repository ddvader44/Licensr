const express=require("express")
const router=express.Router();
const gravatar=require("gravatar")
const bcrypt=require("bcryptjs")
const config =require("config")
const jwt =require("jsonwebtoken")
const {check,validationResult}=require("express-validator")


const User=require("../../models/User")

//@route POST api/users
//@desc  Register User 
//@access Public

router.post("/",[
    check("name","name is required").not().isEmpty(),
    check("email","email is required").isEmail(),
    check("password","password is to be more than 6 characters").isLength({min:6})
],async(req,res) => {
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    var{name,email,password}=req.body

    try {
        //to see if user is already registered
        var user= await User.findOne({email:email})

        if(user){
            res.status(400).json({errors: [{msg:"user already exists"}]})
        }
        //get users gravatar
        const avatar=gravatar.url(email,{
            s:'200',
            r:'pg',
            d:'mm'
        })

        user=new User({
            name,
            email,
            avatar,
            password
        })

        //encrypt password
        
        const salt = await bcrypt.genSalt(10)

        user.password = await bcrypt.hash(password,salt)
        
        await user.save()

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