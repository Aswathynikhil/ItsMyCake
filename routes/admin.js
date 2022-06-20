var express = require('express');
const async = require('hbs/lib/async');
var router = express.Router();
const adminView=require('../details/admin-details')
const Product=require('../models/productSchema')



/* GET users listing. */

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  }
  else {
    res.redirect('/user_login')
  }
}
let admin
router.get('/',verifyLogin , async(req, res) => {
    admin = req.session.admin
    console.log(admin)
    let total_user=await adminView.getUsersCount()
    let total_product=await adminView.getProductCount()
    let total_order=await adminView.getOrderCount()
     let total_return=await adminView.getTotalReturn()
     let orders=await adminView.getAllOrders()
    res.render('admin/dashboard', {admin,total_user,total_product,total_order,total_return,orders})
  })
 /*-----------------admin-dashboard-----------*/
 router.get('/dashboard',(req,res)=>{
    admin=req.session.admin

    res.render('admin/dashboard',{admin})
  })
/*------------view users-----------*/
router.get('/view_users',(req,res)=>{
 admin=req.session.admin
 adminView.getAllUsers().then((User)=>{
  // console.log(User)
   res.render('admin/view_users',{User,admin})
 })
})

/*----------add product---------*/
router.get('/add_product',async(req,res)=>{
  admin=req.session.admin
  const result=await adminView.getCatagory()
  //console.log(result+"boddyyyyyyyyyy");
  const subCat=await adminView.getSubCatagory(req.body)
  //console.log(subCat+'ghhhhhhhhhhhhhhhhh')
  res.render('admin/add_product',{result,subCat,admin})
})

router.post('/add_product',adminView.upload.fields([{name:"image",maxCount:1},{name:"image1",maxCount:3}]),(req,res)=>{
  let mainImage=req.files.image[0].filename
  let nextImage=req.files.image1[0].filename
  let nextImage1=req.files.image1[1].filename
  let nextImage2=req.files.image1[2].filename
  //console.log(req.body)
  adminView.addProduct(req.body,mainImage,nextImage,nextImage1,nextImage2).then((id)=>{
    res.redirect('/admin/view_products')
  })
})
/*-----------view products----------*/
router.get('/view_products',(req,res)=>{
  admin=req.session.admin
  adminView.getAllProducts().then((product)=>{
    //console.log(product)
    res.render('admin/view_products',{product,admin})
  })
  
  })

  /*-----------delete product----------*/
  router.get('/delete_product/:id', (req, res) => {
    let productId = req.params.id
    //console.log(productId)
    adminView.deleteProduct(productId).then((response) => {
      res.redirect('/admin/view_products')
    })
  })


  /*-------------edit product--------------*/
  router.get('/edit_product/:id', async (req, res) => {
    let editProduct = await adminView.getProductDetails(req.params.id)
    //console.log(editProduct)
    const catagoryDetails=await adminView.getCatagory()
    const subcatdetails= await adminView.getSubCatagory()
    res.render('admin/edit_product', { editProduct, subcatdetails,catagoryDetails,admin: true })
  })



  router.post('/edit_product/:id',adminView.upload.fields([{name:"image",maxCount:1},{name:"image1",maxCount:3}]),async(req,res)=>{
    const id=req.params.id 
    let product_det=await Product.findById(id).lean()
  let mainImage=req.files.image?req.files.image[0].filename:product_det.allImages[0].mainImage
  let nextImage=req.files.image1?req.files.image1[0].filename:product_det.allImages[0].nextImage
  let nextImage1=req.files.image1?req.files.image1[1].filename:product_det.allImages[1].nextImage1
  let nextImage2=req.files.image1?req.files.image1[2].filename:product_det.allImages[2].nextImage2

    adminView.updateProduct(req.params.id,req.body,mainImage,nextImage,nextImage1,nextImage2).then(()=>{
      res.redirect('/admin/view_products')
     
    })
  })

//   /*--------------delete user----------*/
//   router.get('/delete_user/:id', (req, res) => {
//     let userId = req.params.id
//     //console.log(userId)
//     adminView.deleteUser(userId).then((response) => {
//       res.redirect('/admin/view_users')
//     })
//   })
// /*---------------------add cake size-----------*/

// router.get('/add_cakesize',(req,res)=>{
//   res.render('admin/add_cakesize',{admin:true})

// })


// router.post('/add_cakesize',(req,res)=>{
//   console.log(req.body.cake_size+':::::::::')
//     adminView.addCakesize(req.body).then((id)=>{
//       res.redirect('/admin/add_cakesize')
//     })
//   })


// /*---------------------add carousal-----------*/

router.get('/add_carousal',async(req,res)=>{
  // admin=req.session.admin
  let carousal_images=await adminView.getImages()
  res.render('admin/add_carousal',{admin:true,carousal_images})


  
})

router.post('/add_carousal',adminView.upload.single('image'),(req,res)=>{
//console.log(req.file+'image==================');
  adminView.addCarousal(req.file.filename).then((id)=>{
    res.redirect('/admin/add_carousal')
  })
})
/*---------------------delete carousal-------------*/
router.get('/delete_carousal/:id', (req, res) => {
  let carousalId = req.params.id
  //console.log(productId)
  adminView.deleteCarousal(carousalId).then((response) => {
    res.redirect('/admin/add_carousal')
  })
})


/*-------------------add catagory-------------*/
router.get('/add_catagory',async(req,res)=>{
  let catgory_names=await adminView.getCatagory()
  res.render('admin/add_catagory',{catgory_names,admin:true})

})

router.post('/add_catagory',adminView.addCatagory)


/*---------------delete-category-----------*/

 router.get('/delete_category/:id', (req, res) => {
  let categoryId = req.params.id
  //console.log(productId)
  adminView.deleteCategory(categoryId).then((response) => {
    res.redirect('/admin/add_catagory')
  })
})

/*--------------------add sub catagory-------------*/

router.get('/add_subcatagory',async(req,res)=>{
  const result=await adminView.getCatagory()
  let subcatgory_names=await adminView.getSubCatagory()
  //console.log(result)
  res.render('admin/add_subcatagory',{admin:true,result,subcatgory_names})
})

router.post('/add_subcatagory',(req,res)=>{
  adminView.addSubcatagory(req.body).then((data)=>{
   // console.log(data)
    res.redirect('/admin/add_subcatagory')
  })
})
router.post('/show-subcatagory',(req,res)=>{
  
})

/*---------------delete-subcategory-----------*/

router.get('/delete_subcategory/:id', (req, res) => {
  let subcategoryId = req.params.id
  //console.log(productId)
  adminView.deleteSubcategory(subcategoryId).then((response) => {
    res.redirect('/admin/add_subcatagory')
  })
})


// *---------------category dropdown-----------*/
router.post('/get_subcategory_dropdown',(req,res)=>{
  // console.log(req.params.name)
  // let categoryId=req.params.id
 adminView.getSubcategoryDropdown(req.body).then((response)=>{
    res.json(response)
  })
})


/*---------------user block and unblock------------*/
router.get("/blockUser/:id", (req, res) => {
  const proId = req.params.id; 
  console.log(proId);
  console.log("sdjfhusguasuashguahshasdgs");
  adminView.blockUser(proId).then((response) => {
    res.json({status:true})
    });
});
router.get("/unBlockUser/:id", (req, res) => {
  const proId = req.params.id;
  console.log("esfhusayfuahiuashahsfhasdu");
  adminView.unBlockUser(proId).then((response) => {  
  });
});


/*-------view orders---------------*/
router.get('/view_orders',async(req,res)=>{
  admin=req.session.admin
  let orders=await adminView.getAllOrders()
    res.render('admin/view_orders',{admin,orders})

})

router.get('/orderstatus-shipped/:id', (req, res) => {
 //admin=req.session.admin
  adminView.changeOrderStatusShipped(req.params.id).then(() => {
    res.redirect('/admin/view_orders')
  })
})
router.get('/orderstatus-delivered/:id', (req, res) => {
  //admin=req.session.admin
 
  adminView.changeOrderStatusdelivered(req.params.id).then(() => {
    res.redirect('/admin/view_orders')
  })
})

// router.get('/orderstatus-shipped',(req,res)=>{
//   res.render('admin/vew_orders')
// })

module.exports = router;

