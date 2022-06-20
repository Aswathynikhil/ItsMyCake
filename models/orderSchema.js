const mongoose= require("mongoose")
const orderSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    address:
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
         },
    // address:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'Address',
    // },
        
         product:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product', 
        
         }],
         total:{
            type:Number,
            
        },
        paymentMethod:{
            type:String
        },
         status:{
             type:String,
         },
        
         Date:{
             type:String,
             default:Date.now
         }
   
})

module.exports=mongoose.model("Order",orderSchema);