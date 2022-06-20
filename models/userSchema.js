const mongoose= require("mongoose")
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique: true,
        

    },
    phone:{
        type:Number,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    place:{
        type:String,
        required:true
    },
    pincode:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    block:{
        type:Boolean,
        default:false
    }
    // token:{
    //     type:String,
    //     default:''
    // }
   
})

module.exports=mongoose.model("User",userSchema);