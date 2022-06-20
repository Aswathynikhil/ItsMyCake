var express = require('express');
const { redirect, status } = require('express/lib/response');
var router = express.Router();
const signup = require('../details/user-details');
let adminView = require('../details/admin-details')
const User = require("../models/userSchema");
const async = require('hbs/lib/async');
const Product = require('../models/productSchema')
//let objectId = require('mongodb').ObjectId
//var mongoose = require('mongoose');

let user
let admin

/* -----------verify login middleware--------*/

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  }
  else {
    res.redirect('/user_login')
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  if (user = req.session.user) {
    console.log(user)
    let cartCount = null
    if (req.session.user) {
      cartCount = await signup.getCartCount(req.session.user._id)
      
    }
    let images= await adminView.getImages()
    adminView.getAllProducts().then((products) => {
      res.render('index', { products, user, cartCount,images });
    })

  }
  // else if (admin = req.session.admin) {

  //   adminView.getAllProducts().then((products) => {
  //     res.render('index', { products, admin });
  //   })
  // }
  else {
    let images= await adminView.getImages()
    adminView.getAllProducts().then((products) => {
      res.render('index', { products ,images});
    })
  }
});

/*------------user signup----------------*/

router.get('/user_signup', (req, res) => {
  res.render('users/user_signup')
})

router.post('/user_signup', signup.doSignup)



/*----------------forget password---------*/

router.get('/forget_password', signup.getUserResetPage)

router.post('/forget_password', signup.forgetPasswordEmailVerify)


/*---------- user and admin login-----------*/
router.get('/user_login', (req, res) => {
  res.render('users/user_login')
})
router.post('/user_login', (req, res) => {
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0');
  signup.doLogin(req.body).then((response) => {

    if (response.user) {

      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')

    }

    else if (response.admin) {
      req.session.loggedIn = true
      req.session.admin = response.admin
      res.redirect('/admin')
    }


    else if (status) {

      res.render('users/user_login', { message_login: "Invalid username or password" })
    }
    else {

      res.render('users/user_login', { message_login: "You are blocked" })

    }

  })
})
router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.admin = null
  res.redirect('/')
})
/*---------About us------------*/
router.get('/aboutUs', (req, res) => {
  if (user = req.session.user) {
    res.render('aboutUs', { user })
  }
  else {
    res.render('aboutUs')
  }
})
/*-------------contact us------------*/
router.get('/contactUs', (req, res) => {
  if (user = req.session.user) {
    res.render('contactUs', { user })
  }
  else {
    res.render('contactUs')
  }
})
/*----------------user-products----------*/
router.get('/user_products', async (req, res) => {
  user = req.session.user
  let categories = await adminView.getCatagory()
  let subcat = await adminView.getSubCatagory()
  //console.log(subcat+"gggggggggggggggggggggg");
  let products = await adminView.getAllProducts()
  //console.log(products+"products.........");
  // adminView.getAllProducts().then((products) => {
  res.render('users/user_products', { products, categories, subcat, user })
  // })

})
/*---------------verify OTP--------------*/
router.get('/verify_otp', (req, res) => {
  res.render('users/verify_otp')
})
router.post('/verify_otp', signup.verifyOTP)

/*---------forget password verify otp-----------*/

router.get('/forgetVerify_otp', (req, res) => {
  res.render('users/forgetVerify_otp')

})

router.post('/forgetVerify_otp', signup.forgetPasswordOTP)
/*------------reset password-----------*/
router.get('/reset_password', (req, res) => {
  res.render('users/reset_password')
})
router.post('/reset_password', signup.updateNewPassword)




/*--------------product details------------ */
router.get('/product_details/:id', async (req, res) => {
  if (req.session.user) {
    let prodDetails = await adminView.getProductDetails(req.params.id)
    // console.log(prodDetails)
    res.render('product_details', { prodDetails, user })
  }
  else {
    let prodDetails = await adminView.getProductDetails(req.params.id)
    //console.log(prodDetails)
    res.render('product_details', { prodDetails })
  }
})




/*----------------user profile------------*/
// have to change name
router.get('/user_profile/:id', async (req, res) => {
  user = req.session.user
  let user_details = await signup.getUserDetails(req.params.id)
  //console.log(user_details + 'kkkkkkkkkkkkkkk')
  res.render('users/user_profile', { user_details, user })
})
router.post('/user_profile/:id', async (req, res) => {
  user = req.session.user
  let userEditDetails = await signup.getUserDetails(req.params.id)
  res.render('users/edit_profile', { userEditDetails, user })
})

/*--------------edit-profile-----------*/

router.post('/edit_profile/:id', async (req, res) => {
  user = req.session.user
  signup.updateUser(req.params.id, req.body).then(() => {

    res.redirect('/user_profile/' + req.params.id)
  })
})



/*---------------cart-----------------*/


router.post('/add_to_cart/:id', verifyLogin, (req, res) => {
  user = req.session.user
  signup.addToCart(req.params.id, req.session.user._id, req.body).then(() => {
    res.redirect('/cart')
  })

})


router.get('/cart', verifyLogin, async (req, res) => {
  user = req.session.user

  let products = await signup.getCartProducts(req.session.user._id)
  let total = await signup.getTotalAmount(user._id)
  // console.log(products+ 'iiiiiiiiiiiiiiiii')
  res.render('users/cart', { user, products, total })

})


// -----------------change quantity------------

router.post('/change_quantity', (req, res) => {
  user = req.session.user
  //console.log(req.body)
  signup.changeProductQuantity(req.body, user).then((response) => {
    //console.log(response)
    res.json(response)
  })


})
router.get('/delete_cart_product/:id', (req, res) => {

  let productId = req.params.id
  let userId = req.session.user._id
  let cartDetails = req.body

  signup.deleteCartProduct(productId, userId, cartDetails).then(() => {
    res.redirect('/cart')
  })
})



router.get('/save-address', async (req, res) => {
  user = req.session.user
  // let user_details = await signup.getUserDetails(user._id)  ,user_details
  let total = await signup.getTotalAmount(user._id)
  let allAddress = await signup.getAllAddress(user._id)
  res.render('users/save-address', { user, total, allAddress })
})


router.post('/save-address', async (req, res) => {
  signup.saveAddress(req.body).then((response) => {
    res.json({status:true})
  })
  // console.log(req.body);
})

router.get('/delivery-address/:id', async (req, res) => {
  user = req.session.user
  //console.log(req.params.id+"addressid");
  let userAddressDetails = await signup.getAddressDetails(req.params.id)
  //console.log(userAddressDetails+"useraddress");
  let total = await signup.getTotalAmount(req.session.user._id)
  res.render('users/place-order', { user, total, userAddressDetails })

})
router.post('/place-order', async (req, res) => {
  user = req.session.user
  let products = await signup.getCartProductList(req.body.userId)
  let totalPrice = await signup.getTotalAmount(req.body.userId)
  signup.placeOrder(req.body, products, totalPrice).then((orderId) => {
    if (req.body['payment-method'] === 'COD') {
      res.json({ codSuccess: true })
    } else {
      signup.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response)
      })
    }

  })
  //console.log(req.body);
})

router.get('/order-success', async (req, res) => {
  user = req.session.user
  //console.log(user._id);
  res.render('users/order-success', { user })
})

router.get('/orders-list', async (req, res) => {
  user = req.session.user
  let orders = await signup.getUserOrders(user._id)
  res.render('users/orders-list', { user, orders })
})


router.post('/verify-payment', (req, res) => {
  console.log(req.body)
  signup.verifyPayment(req.body).then(() => {
    signup.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log('Payment successfull');
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err + "error");
    res.json({ status: false, errMsg: 'payment failed' })
  })
})


router.get('/find-subcategories/:id', async (req, res) => {
  user = req.session.user
  console.log("haiiiii");
  let categories = await adminView.getCatagory()
  let product = await adminView.getCategoryProducts(req.params.id)
  let subCat = await adminView.getSubcategoryDropdown(req.params.id)
  console.log(subCat + "subcat");
  res.render('users/Categorywise', { user, subCat, product, categories })
})

router.get('/find-subcategory-products/:id', async (req, res) => {
  user = req.session.user
  let subcategory = await adminView.getSubcategoryDropdown(req.params.id)
  console.log(subcategory + "----------------");
  console.log("hellloooooooo");
  let categories = await adminView.getCatagory()
  let subCat = await adminView.getSubCatagorySelected(req.params.id)
  let products = await adminView.getSubCategoryProducts(req.params.id)
  res.render('users/subcategorywise', { user, categories, subCat, products, subcategory })

})
router.post('/search', async (req, res) => {
  let searchText = req.body['search_name'];
  console.log(searchText + "ooooooooooooooooooo");
  try {
    let products_search=await adminView.getAllProducts()

  if (searchText) {
   let products = products_search.filter((u) => u.product_name.includes(searchText));
      if(products){
      console.log(products, "products");
      res.render('index', {products})
      }
      else{
        res.render('index',{message:'No matching Products'})
      } 
    }
   
   
  } catch (err) {
   console.log(err);
  }
 
})

module.exports = router;
