const res = require('express/lib/response')
const async = require('hbs/lib/async')
const db = require('../config/connection')
const Product = require('../models/productSchema')
const User = require('../models/userSchema')
const Catagory = require('../models/catagorySchema')
const SubCatagory=require('../models/subCatagorySchema')
const Order=require('../models/orderSchema')
const multer = require('multer');
const { redirect, send } = require('express/lib/response')
const { promises } = require('nodemailer/lib/xoauth2')
//const path=require('path')
//const { reject } = require('bcrypt/promises')
let objectId = require('mongodb').ObjectId
const Image=require('../models/imageSchema')
const cakesize= require('../models/cakesizeSchema')


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, ('./public/product_Images'))
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '--' + file.originalname)
    }
});
const upload = multer({ storage: storage })


const addProduct = (adminProduct, mainImage, nextImage,nextImage1,nextImage2) => {
    return new Promise(async (resolve, reject) => {
        const subcatagories= await SubCatagory.findOne({subcatagory:adminProduct.subcatagory})
        const catagories= await Catagory.findOne({catagory:adminProduct.catagory})
        console.log(catagories+"catagories");
        console.log(subcatagories+"subcatagories");
        let main_i = mainImage
        let next_i = nextImage
        let next_i_1=nextImage1
        let next_i_2=nextImage2
        const product = await new Product({
            product_name: adminProduct.product_name,
            catagory:catagories._id,
            subCatagory:subcatagories._id,
            description: adminProduct.description,
            price: adminProduct.price,
            discount: adminProduct.discount,
            allImages: { main_i, next_i ,next_i_1,next_i_2}
        })
        await product.save().then((data) => {
            // console.log(data);
            resolve(data)
        })
    })
}


const deleteProduct = (productId) => {
    return new Promise((resolve, reject) => {
        Product.deleteOne({ _id: productId }).then((response) => {
            console.log(response);
            resolve(response)
        })
    })
}

const getProductDetails = (productId) => {
    return new Promise((resolve, reject) => {
       // Product.findOne({ _id: productId }).lean().then((editProduct) => {
        const getproductdetails=Product.findOne({_id:productId}).lean().populate('subCatagory').populate('catagory')
            console.log(getproductdetails+'gffffffffffff')
            resolve(getproductdetails)
        })
   // })
}



const updateProduct=(productId,productEditDetails,mainImage,nextImage,nextImage1,nextImage2)=>{
    return new Promise(async(resolve,reject)=>{
       let main_i=mainImage
          let next_i=nextImage
          let next_i_1=nextImage1
          let next_i_2=nextImage2
          const subcategories=await SubCatagory.findOne({subcatagory:productEditDetails.subcatagory})
          const catagories= await Catagory.findOne({catagory:productEditDetails.catagory})
          console.log(subcategories)
      Product.updateOne({_id:productId},{
        $set:{
              name:productEditDetails.name,
              product_name: productEditDetails.product_name,
              catagory:catagories._id,
               subcatagory:subcategories._id, 
               description: productEditDetails.description,
                 price: productEditDetails.price,
                 product_weight: productEditDetails.product_weight,
                 discount: productEditDetails.discount,
                 allImages: { main_i, next_i ,next_i_1,next_i_2}
        }
      }).then((response)=>{
        resolve()
      })
    })
  }

// const deleteUser = (userId) => {
//     return new Promise((resolve, reject) => {
//         User.deleteOne({ _id: objectId(userId) }).then((response) => {
//             console.log(response);
//             resolve(response)
//         })
//     })
// }


const getAllUsers = () => {
    return new Promise(async (resolve, reject) => {
        let userinfo = await User.find().lean()
        let usercount= await User.count()

        resolve(userinfo)
       
    })
}
const getUsersCount=()=>{
    return new Promise(async(resolve,reject)=>{
        let usercount= await User.count()
        resolve(usercount)
    })
}


const getAllProducts = () => {
    return new Promise(async (resolve, reject) => {
        Product.find().lean().populate('subCatagory').populate('catagory').then((product_details)=>{
                    resolve(product_details)
                       console.log(product_details);
            
                     })
    })
}
const getProductCount=()=>{
    return new Promise(async (resolve, reject) => {
        let productcount= await Product.count() 
        resolve(productcount)
    })
}
const getOrderCount=()=>{
    return new Promise(async (resolve, reject) => {
        let ordercount= await Order.count() 
        resolve(ordercount)
    })
}
const getTotalReturn=()=>{
  
    return new Promise(async(resolve,reject)=>{
         totalamount=await Order.aggregate([
     
        {
            $group:{
                _id:null,
                total:{
                    $sum:"$total"
                }
            }
        }

          
     ])
        // console.log(totalamount[0].total+"fgkddfskj");
        let sum=totalamount.length ? totalamount[0].total:0
     
        resolve(sum)
    })
}



const addCatagory = async (req, res) => {
    try {

        const catagory_data = await Catagory.find()
        if (catagory_data.length > 0) {
            let checking = false;
            for (let i = 0; i < catagory_data.length; i++) {
                if (catagory_data[i]['catagory'].toLowerCase() === req.body.catagory_name.toLowerCase()) {
                    checking = true;
                    break;
                }
            }
            if (checking == false) {
                const catagory = new Catagory({
                    catagory: req.body.catagory_name
                })
                const catagory_data = await catagory.save()
                console.log(catagory_data)
                // res.status(200).send({success:true,message:'catagory data',data:catagory_data})
                res.redirect('/admin/add_catagory')
            }
            else{
                res.status(200).send({success:true,message:"this catagory ("+req.body.Catagory+") is already exists" })
            }
        }
        else{
            const catagory = new Catagory({
                catagory: req.body.catagory_name
            })
            const catagory_data = await catagory.save()
            console.log(catagory_data)
            // res.status(200).send({success:true,message:'catagory data',data:catagory_data})
            res.redirect('/admin/add_catagory')
        }




    }
    catch (error) {
        res.status(400).send({ success: false, message: error.message })

    }
}


const getCatagory=()=>{
    return new Promise(async(resolve,reject)=>{
       await Catagory.find().lean().populate('catagory').then((catagory_data)=>{
            resolve(catagory_data)
            console.log(catagory_data+"kkkkkkkkkkkkkkkkkk")
        })
    })
}


const  deleteCategory = (categoryId) => {
    return new Promise((resolve, reject) => {
        Catagory.deleteOne({ _id: categoryId }).then((response) => {
            console.log(response);
            resolve(response)
        })
    })
}
// const addCakesize=(size)=>{
//     return new Promise(async(resolve,reject)=>{
//        let cake_size=size
//       const newsize=new cakesize({
//         cakesize:cake_size
//       })
//       await newsize.save().then((data)=>{
//         console.log(data)
//         resolve(data)
//     })
//     })
// }
const addSubcatagory=(data)=>{
try{
     return new Promise (async(resolve,reject)=>{
         const newcatagory= await Catagory.findOne({catagory:data.catagory_name})
         console.log(newcatagory)
         const newsubcatagory = new SubCatagory({
            subcatagory: data.subcatagory,
            catagory:newcatagory._id
        })
        await newsubcatagory.save().then((data)=>{
            console.log(data)
            resolve(data)
        })
     })
}
catch(error){
    console.log(error.message)
}
}

const getSubCatagory=(catagory)=>{
    return new Promise(async(resolve,reject)=>{
    const displaySubCatagory= await SubCatagory.find().lean().populate('subcatagory').populate('catagory')
    console.log(displaySubCatagory+"catagoryyyyyyyyyyyy");


   
            resolve(displaySubCatagory)
         
         
        })
}

const  deleteSubcategory= (subcategoryId) => {
    return new Promise((resolve, reject) => {
        SubCatagory.deleteOne({ _id: subcategoryId }).then((response) => {
            console.log(response);
            resolve(response)
        })
    })
}

const getSubcategoryDropdown=(categoryId)=>{
 
return new Promise(async(resolve,reject)=>{
    const displaySubCategoryDropdown= await SubCatagory.find({catagory:categoryId}).lean().populate('catagory')
    console.log(displaySubCategoryDropdown+"displaySubCategoryDropdown,,,,,,,,,");
    resolve(displaySubCategoryDropdown)
})
}

const getCategoryProducts=(categoryId)=>{
    return new Promise(async(resolve,reject)=>{
        Product.find({catagory:categoryId}).lean().populate('subCatagory').populate('catagory').then((product_details)=>{
            resolve(product_details)
               console.log(product_details);
    
             })

    })
}

const getSubCategoryProducts=(subcategoryId)=>{
    return new Promise(async(resolve,reject)=>{
        Product.find({subCatagory:subcategoryId}).lean().populate('subCatagory').populate('catagory').then((product_details)=>{
            resolve(product_details)
               console.log(product_details);
    
             })

    })
}
const getSubCatagorySelected=(subcategoryId)=>{
    return new Promise(async(resolve,reject)=>{
        const displaySubCatagory= await SubCatagory.find({_id:subcategoryId}).lean().populate('subcatagory').populate('catagory')
        console.log(displaySubCatagory+"catagoryyyyyyyyyyyy");
    
    
       
                resolve(displaySubCatagory)
             
             
            })
}

const addCarousal=(newImage)=>{
    return new Promise(async(resolve,reject)=>{
        let carousal_image=newImage
        const imgObj=new Image({
            image:carousal_image
        })
    await imgObj.save().then((data) => {
        // console.log(data);
        resolve(data) 
    })
    })

}
const  deleteCarousal = (carousalId) => {
    return new Promise((resolve, reject) => {
        Image.deleteOne({ _id: carousalId }).then((response) => {
            console.log(response);
            resolve(response)
        })
    })
}
const getImages=()=>{
    return new Promise(async(resolve,reject)=>{
        await Image.find().lean().then((image_details)=>{
            console.log(image_details+"imageeeeeeeeee")
            resolve(image_details)
        })
    })
}


const blockUser= (userId) => {
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      const user = await User.findByIdAndUpdate(
        { _id: userId },
        { $set: { block: true } },
        { upsert: true }
      );
      resolve(user);
    });
  }
  
 const unBlockUser= (userId) => {
    return new Promise(async (resolve, reject) => {
      const user = await User.findByIdAndUpdate(
        { _id: userId },
        { $set: { block: false } },
        { upsert: true }
      );
      resolve(user);
    });
  }


  const getAllOrders=()=>{
      return new Promise(async (resolve, reject) => {
            let userOrder = await Order.find().populate('product').lean().populate()
            console.log(userOrder + "userorder")
            resolve(userOrder)
        })
   
  }

const changeOrderStatusShipped=(orderId)=>{
    console.log(orderId);
    return new Promise(async(resolve,reject)=>{
      let order=await Order.findByIdAndUpdate({_id:orderId},{
            $set:{status:'shipped'}
        })
         resolve(order)
       
       
    })
}

const changeOrderStatusdelivered=(orderId)=>{
    console.log(orderId);
    return new Promise(async(resolve,reject)=>{
      let order=await Order.findByIdAndUpdate({_id:orderId},{
            $set:{status:'delivered'}
        })
         resolve(order)
       
       
    })
}


module.exports = {
    upload,
    addProduct,
    deleteProduct,
    getProductDetails,
    updateProduct,
   // deleteUser,
    getAllUsers,
    getAllProducts,
    addCatagory,
    getCatagory,
    addSubcatagory,
    getSubCatagory,
    deleteCategory,
    deleteSubcategory,
    getSubcategoryDropdown,
    blockUser,
    unBlockUser,
    getCategoryProducts,
    getSubCategoryProducts,
    getSubCatagorySelected,
    getAllOrders,
    changeOrderStatusShipped,
    changeOrderStatusdelivered,
    getUsersCount,getProductCount,getOrderCount,
    getTotalReturn,addCarousal,getImages,deleteCarousal
}