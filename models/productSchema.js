const mongoose=require('mongoose')
const productSchema= new mongoose.Schema({
   
    product_name:{
        type:String,
        required:true
    },
    catagory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Catagory',
        required:true
    },
    subCatagory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'SubCatagory',
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    // product_quantity:{
    //     type:Number,
    //     required:true
    // },
    // product_weight:{
    //     type:Number,
    //     required:true
    // },
    discount:{
        type:Number,
        
    },
    allImages:{
         type:Array,
         //required:true
    },

})


module.exports=mongoose.model('Product',productSchema);