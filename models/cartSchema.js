const mongoose=require('mongoose')
const cartSchema= new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',

    },
    cartItems:[
        {
          product:{
              
              type:mongoose.Schema.Types.ObjectId,
              ref:'Product',
            },
            quantity:{
                type:Number,
                default:1
            },
            delivery_date:{
                type:String
                
                
            },
            weight:{
                type:Number
                
            },
            message:{
                type:String
                
            },
            price:{
                type:Number
            },
            sub_total:{
                type:Number,
                default:0

            },
            shippingCharge:{
                type:Number,
                default:50
              },
       
        }
    ],
    
    total:{
        type:Number,
        default:0
        
    },
  
})
module.exports=mongoose.model('Cart',cartSchema);