const mongoose=require("mongoose")
const config =require("config")
const db=config.get("mongoURI")

const connectDB=async() => {
    try {
        await mongoose.connect(db,{
            useNewUrlParser:true,
            useUnifiedTopology: true,
            useCreateIndex:true,
            useFindAndModify:false
        })
        console.log("db also connected")
    } catch (error) {
        console.error(error.message)
        process.exit(1)  //exiting with error failiure...
    }
}

module.exports=connectDB;
