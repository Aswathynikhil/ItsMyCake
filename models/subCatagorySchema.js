const mongoose=require('mongoose')
const subCatagorySchema= new mongoose.Schema({
    subcatagory:{
        type:String,
        required:true
    },
    catagory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Catagory',
        required:true
    }
})

module.exports=mongoose.model('SubCatagory',subCatagorySchema);