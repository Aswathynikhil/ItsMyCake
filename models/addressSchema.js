const mongoose= require("mongoose")
const addressSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    address:[
        {
            name:{
                type:String,
               
            },
            phone:{
                type:Number,
              
            },
            housename:{
                type:String,
              
            },
            place:{
                type:String,
              
            },
            pincode:{
                type:Number,
               
            }
         }]
   
})

module.exports=mongoose.model("Address",addressSchema);