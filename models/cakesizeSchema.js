const mongoose=require('mongoose')
const cakesizeSchema= new mongoose.Schema({
    cakesize:{
        type:Number,
        required:true
    }
})

module.exports=mongoose.model('Cakesize',cakesizeSchema);