const db = require('../config/connection');
const User = require("../models/userSchema");
const Admin = require('../models/adminSchema');
const Product = require('../models/productSchema')
var moment = require('moment')
const bcrypt = require('bcrypt');
//const { promise } = require('bcrypt/promises');
const async = require('hbs/lib/async');
const { updateOne, count } = require('../models/userSchema');
const nodemailer = require('nodemailer');
const { promises } = require('nodemailer/lib/xoauth2');
//const cartSchema = require('../models/cartSchema');
//const randomstring=require('randomstring')
let objectId = require('mongodb').ObjectId
let Cart = require('../models/cartSchema');
//const { default: mongoose } = require('mongoose');
const mongoose = require('mongoose')
const Address = require('../models/addressSchema')
const Order=require('../models/orderSchema')
require('dotenv').config()
const Razorpay = require('razorpay');
const SubCatagory = require('../models/subCatagorySchema');

var instance = new Razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_KEY,
});

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;
    } catch (err) {
        console.log(err.message)
    }
}


/*-----------for otp verification in signup-----------*/

const sendVerifyMail = async (name, email, otpGenerator) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            service: 'gmail',
            port: 587,
            secure: false,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        console.log(otpGenerator);
        const mailOptions = {
            from: process.env.NODEMAILER_USER,
            to: email,
            subject: 'for email verification',
            text: 'Your otp code is ' + otpGenerator
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error)
            }
            else {
                console.log("mail has been send", info.response)
            }
        })

    }
    catch (error) {
        console.log(error);
    }
}


/*--------------verify otp-----------*/

const verifyOTP = async (req, res) => {
    let userOTP = req.body.otp
    let userNewOTP = req.session.OTP
    let userDetails = req.session.userDetails
    //console.log(userDetails)
    try {
        if (userNewOTP == userOTP) {
            const user = new User({
                name: userDetails.name,
                email: userDetails.email,
                phone: userDetails.phone,
                address: userDetails.address,
                place: userDetails.place,
                pincode: userDetails.pincode,
                password: userDetails.password
            })

            const newUser = await user.save();
            req.session.userLoggedIn = true
            req.session.user = newUser
            req.session.userDetails = null
            req.session.OTP = null
            res.redirect("/")
        } else {
            req.session.ErrOtp = "Invalid OTP !!!"
            res.redirect("/verify_otp")
        }

    }
    catch (error) {
        console.log(error)
    }
}



const doSignup = async (req, res) => {
    try {
        const userPassword = await securePassword((req.body.password));

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            place: req.body.place,
            pincode: req.body.pincode,
            password: userPassword
        })
        //console.log(user)
        req.session.userDetails = user

        const otpGenerator = Math.floor(1000 + Math.random() * 9000);
        console.log(otpGenerator)
        req.session.OTP = otpGenerator;

        if (user) {
            sendVerifyMail(req.body.name, req.body.email, otpGenerator)
            res.redirect('/verify_otp');

        } else {
            res.redirect('/user_signup');

        }

    }
    catch (error) {
        console.log(error)
    }

}


const doLogin = (userData) => {
    console.log(userData)
    return new Promise(async (resolve, reject) => {
        let response = {}
        let  blockstatus=false
        let user = await User.findOne({ email: userData.email })
        let admin = await Admin.findOne({ email: userData.email })
        if (user) {
            console.log(user.block)
            if(user.block)
            {
            
                console.log("login failed");
                resolve({blockstatus:true})
            }
           else{
            bcrypt.compare(userData.password, user.password).then((status) => {
                if (status) {
                    console.log("login successfully");
                    response.user = user
                    response.status = true
                    resolve(response)
                }
                else {
                    console.log("login failed")
                    resolve({ status:false })
                }
            
            })
        }
       
       
        }
        else if (admin) {

            if (userData.password == admin.password) {
                console.log("login successfully");
                response.admin = admin
                response.status = true
                resolve(response)
            }
            else {
                console.log("login failed")
                resolve({ status: false })
            }

        }
        else {
            console.log("login failed");
            resolve({ status: false })
        }
    })
}


// /*---------------for reset password send mail------------------*/

// const sendPasswordResetMail = async (name, email, tocken) => {
const sendPasswordResetMail = async (name, email, otpGenerator) => {
    try {
        const mailTransporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            service: "gmail",
            port: 587,
            secure: false,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS
            },
            tls: {
                rejectUnauthorized: false
            }

        });

        const mailDetails = {
            from: process.env.NODEMAILER_USER,
            to: email,
            subject: "Reset Password",
            text: 'Your otp code is ' + otpGenerator
            // text: "just random texts ",
            // html: '<p>Hi ' + name + ' click <a href ="http://localhost:3000/users/reset_password?tocken=' + tocken + '"> here to </a> to reset your password</p>'
        }
        mailTransporter.sendMail(mailDetails, (err, Info) => {
            if (err) {
                console.log(err);
            } else {
                console.log("email has been sent ", Info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}
// /*--------------------forget password-----------*/



const getUserResetPage = async (req, res) => {

    try {

        res.render("users/forget_password", { mailMsg: req.session.checkMailMsg, Errmsg: req.session.checkMailErr })
        req.session.checkMailMsg = false
        req.session.checkMailErr = false
    } catch (error) {
        console.log(error);
    }
}

const forgetPasswordEmailVerify = async (req, res) => {
    try {
        const email = req.body.email;
        //console.log(email);
        const userResetData = await User.findOne({ email: email })
        //console.log(userResetData);
        req.session.userResetid = userResetData._id;
        if (userResetData) {
            // const validRandomString=randomstring.generate();
            // req.session.randomString = validRandomString;

            const otpGenerator = Math.floor(1000 + Math.random() * 9000);
            console.log(otpGenerator)
            req.session.OTP = otpGenerator;
            // sendPasswordResetMail(userResetData.name,userResetData.email,validRandomString); 
            sendPasswordResetMail(userResetData.name, userResetData.email, otpGenerator);
            req.session.checkMailMsg = "Check your Email to reset your password"
            //res.redirect("/forget_password")
            res.redirect('/forgetVerify_otp')

        }
        else {
            req.session.checkMailErr = "Invalid Email Id"
            res.redirect("/forget_password")
        }
    }
    catch (error) {
        console.log(error.message)
    }
}





/*-------------- forget password verify otp-----------*/

const forgetPasswordOTP = async (req, res) => {
    let userOTP = req.body.otp
    let userNewOTP = req.session.OTP
    //let userDetails=req.session.userDetails
    // console.log(userDetails)
    try {
        if (userNewOTP == userOTP) {
            req.session.OTP = null
            res.redirect("/reset_password")

        } else {
            req.session.ErrOtp = "Invalid OTP !!!"
            res.redirect("/verify_otp")
        }

    }
    catch (error) {
        console.log(error)
    }
}


/*------------- update the user password------------*/
const updateNewPassword = async (req, res) => {

    try {
        const newPassword = req.body.password
        console.log(newPassword)
        const confirmPassword = req.body.repassword
        console.log(confirmPassword)
        if (newPassword == confirmPassword) {
            const resetId = req.session.userResetid
            console.log(resetId)
            const newSecurePassword = await securePassword(newPassword);
            const updatedUserData = await User.findByIdAndUpdate({ _id: resetId }, { $set: { password: newSecurePassword } })
            console.log(updatedUserData)
            //req.session.randomString = null;
            req.session.userResetid = null;
            req.session.resetSuccessMsg = "Your password updated successfully.."
            res.redirect("/user_login")
        }
        else {
            // res.render('users/resest_password',{message:"Password doesn't match"})
            req.session.resetErrorMsg = "Password doesn't match"
            res.redirect("/reset_password")
        }

    } catch (error) {
        console.log(error.message);
    }
}
const getUserDetails = (userId) => {
    return new Promise((resolve, reject) => {
        const getuserdetails = User.findOne({ _id: userId }).lean()
        console.log(getuserdetails + 'gffffffffffff')
        resolve(getuserdetails)
    })
}

const updateUser = (userId, userEditDetails) => {
    return new Promise(async (resolve, reject) => {
        User.updateOne({ _id: userId }, {
            $set: {
                name: userEditDetails.name,
                email: userEditDetails.email,
                phone: userEditDetails.phone,
                address: userEditDetails.address,
                place: userEditDetails.place,
                pincode: userEditDetails.pincode,

            }
        }).then((response) => {
            resolve(response)
        })
    })
}

const addToCart = (productId, userId, details, quantity) => {
    let delivery_date = details.delivery_date;
    let weight = parseFloat(details.weight);
    console.log(weight)
    let weightAdd = weight + weight;
    console.log(weightAdd + "weight")
    let message = details.message;
    let price = parseInt(details.price);
    console.log(price + "price")
    let newPrice = weightAdd * price;
    console.log(newPrice + "newPrice")
    return new Promise(async (resolve, reject) => {
        let userCart = await Cart.findOne({ userId: userId })
        console.log(userCart)
        if (userCart) {
            const prodExist = userCart.cartItems.findIndex(product => product.product == productId)
            console.log(prodExist)
            if (prodExist != -1) {

                let userFind = await Cart.findOne({ userId: userId, 'cartItems.product': productId, 'cartItems.weight': weight })

                if (userFind) {

                    Cart.updateOne({ 'cartItems.product': productId, 'cartItems.weight': weight, userId: userId }, { $inc: { 'cartItems.$.quantity': 1, 'cartItems.$.sub_total': price } }).then(() => {

                        resolve()
                    })

                } else {
                    Cart.updateOne({ userId: userId }, { $push: { cartItems: [{ product: productId, quantity: quantity, delivery_date: delivery_date, weight: weight, message: message, price: newPrice, sub_total: newPrice }] } }).then((response) => {
                        resolve()
                    })

                }
            }
            else {
                Cart.updateOne({ userId: userId }, { $push: { cartItems: [{ product: productId, quantity: quantity, delivery_date: delivery_date, weight: weight, message: message, price: newPrice, sub_total: newPrice }] } }).then((response) => {
                    console.log(response)
                    resolve()
                })


            }

        }
        else {
            let cartObj = {
                userId: userId, cartItems: [{ product: productId, quantity: quantity, delivery_date: delivery_date, weight: weight, message: message, price: newPrice, sub_total: newPrice }]
            }
            Cart.create(cartObj).then((response) => {
                resolve()
            })
        }
    })
}



const getCartProducts = (userId) => {
    return new Promise(async (resolve, reject) => {
        let cartDetails = await Cart.find({ userId: userId }).lean().populate('cartItems.product')
        resolve(cartDetails)
        //console.log(cartDetails+'pppppppppppp')
    })

}
const getCartCount = (userId) => {
    return new Promise(async (resolve, reject) => {
        let count = 0
        let cart = await Cart.findOne({ userId: userId })
        if (cart) {
            count = cart.cartItems.length
        }
        resolve(count)
    })
}


const changeProductQuantity = (details) => {
    console.log(details)
    let weight = parseFloat(details.weight)
    let count = parseInt(details.count);
    let price = parseInt(details.price)
    console.log(price + "newPrice")
    let quantity = parseInt(details.quantity);
    console.log(count)



    return new Promise((resolve, reject) => {
        if (count == -1 && quantity == 1) {
            Cart.updateOne({ 'cartItems._id': details.cart, 'cartItems.product': details.product, 'cartItems.weight': details.weight }, { $pull: { cartItems: { product: details.product, weight: details.weight } }, total: details.total, shippingCharge: details.shippingCharge })
                .then((response) => {
                    console.log(response)
                    resolve({ removeProduct: true })

                })
        }
        else if (count == 1) {
            let qty = parseInt(details.quantity) + 1;
            let sub_total = qty * price;
            console.log(sub_total)
            Cart.updateOne({ 'cartItems._id': details.cart, 'cartItems.product': details.product, 'cartItems.weight': weight }, { $inc: { 'cartItems.$.quantity': count }, $set: { 'cartItems.$.sub_total': sub_total } })
                .then((response) => {
                    console.log(response)
                    resolve({ staus: true });
                })
        }
        else if (count == -1) {
            let qty = parseInt(details.quantity) - 1;
            console.log(quantity)
            let sub_total = qty * price;
            console.log(sub_total)
            Cart.updateOne({ 'cartItems.product': details.product, 'cartItems._id': details.cart, 'cartItems.weight': weight }, { $inc: { 'cartItems.$.quantity': count }, $set: { 'cartItems.$.sub_total': sub_total } })
                .then((response) => {
                    console.log(response)
                    resolve({ staus: true });
                })
        }
    })

}
const deleteCartProduct = (productId, userId, details) => {
    console.log(productId, userId)
    let weight = details.weight
    console.log(weight + "weight in delete")
    return new Promise((resolve, reject) => {
        Cart.updateOne({ userId: userId }, { $pull: { cartItems: { product: productId } } }).then((response) => {
            console.log(response)
            resolve(response)
        })
    })
}

const getTotalAmount = (userId) => {
    return new Promise(async (resolve, reject) => {
        let userCart = await Cart.findOne({ userId: userId })
        console.log(userCart + "user")
        let id = mongoose.Types.ObjectId(userId)
        if (userCart) {
            let totalAmount = await Cart.aggregate([
                {
                    $match: { userId: id }
                },
                {
                    $unwind: "$cartItems"
                },
                {
                    $project: {
                        sub_total: "$cartItems.sub_total",
                        shippingCharge: "$cartItems.shippingCharge"

                    }
                },
                {
                    $project: {
                        sub_total: 1,
                        shippingCharge: 1
                    }
                },
                {
                    $group: {
                        _id: null,
                        total_a: { $sum: "$sub_total" },
                        ship: { $sum: "$shippingCharge" }

                    }
                },
                {
                    $addFields: {
                        total: { $sum: ["$total_a", "$ship"] }
                    }
                }

            ])
            console.log(totalAmount + "total")
            console.log(totalAmount.length + "length")
            if (totalAmount.length == 0) {
                resolve()
            }
            else {
                let grandTotal = totalAmount.pop();
                console.log(grandTotal.total + "grandtotal")
                await Cart.findOneAndUpdate({ userId: userId }, { $set: { total: grandTotal.total } })
               resolve(grandTotal)
             }
        }
        else {
            resolve()
        }
    })
}

const saveAddress = (details) => {
    return new Promise(async (resolve, reject) => {
        let userAddress = await Address.findOne({ userId: details.userid })
        console.log(userAddress + "userAddress");
        if (userAddress) {
            Address.updateOne({ userId: details.userid }, {
                $push: {
                    address: [{
                        name: details.name,
                        phone: details.phone,
                        housename: details.housename,
                        place: details.place,
                        pincode: details.pincode
                    }],
                }
            }).then((response) => {
                console.log(response)
                resolve()
            })
        } else {
            let addressObj = {
                userId: details.userid,
                address: [{
                    name: details.name,
                    phone: details.phone,
                    housename: details.housename,
                    place: details.place,
                    pincode: details.pincode
                }],
                userId: details.userid
            }
            Address.create(addressObj).then((response) => {
                resolve()
            })
        }


    })
}
const getAllAddress = (userId) => {
    return new Promise(async (resolve, reject) => {
        let userAddress = await Address.find({ userId: userId }).lean().populate('address')
        resolve(userAddress)
        //console.log(cartDetails+'pppppppppppp')
    })
}

const getAddressDetails = (addressId) => {
    console.log(addressId + "---------------")
    return new Promise(async (resolve, reject) => {
        let id = mongoose.Types.ObjectId(addressId)
        const addressDetails = await Address.aggregate([
            {
                $unwind: "$address"
            },
            {
                $match: { 'address._id': id }
            }
        ])

        console.log(addressDetails + 'gffffffffffff')

        resolve(addressDetails[0])
        console.log(addressDetails[0]);
    })
}

const placeOrder = (order, products, totalPrice) => {
    return new Promise(async (resolve, reject) => {
        console.log(order, products, totalPrice.total + "ffffffffffffff");
        let status = order['payment-method'] === "COD" ? "ordered" : "pending"
        let orderObj = {
            address: {
                name: order.name,
                phone: order.phone,
                housename: order.housename,
                place: order.place,
                pincode: order.pincode
            },
            userId: order.userId,
            product: products,
            total: totalPrice.total,
            paymentMethod: order["payment-method"],
            status: status,
            Date:moment().format('DD-MMM-YYYY'),
      
        }
        Order.create(orderObj).then((response) => {
            Cart.deleteOne({ userId: order.userId }).then((response) => {
                resolve()
            })
            resolve(response._id)
        })
        // }


    })
}
const getCartProductList = (userId) => {

    return new Promise(async(resolve,reject)=>{
        id=mongoose.Types.ObjectId(userId)
        let cart=await Cart.aggregate([
            {
               $match:{
                userId:id
               }
            },
            {
                  $unwind:'$cartItems'
            },{
                $project:{
                    _id:'$cartItems.product'
                }
            }
        ])
        console.log('1234569999');
        console.log(cart);
        resolve(cart)
        
    })
}

const getUserOrders = (userId) => {
    return new Promise(async (resolve, reject) => {
        let userOrder = await Order.find({ userId:userId }).populate('product').lean()
        console.log(userOrder + "userorder")
        resolve(userOrder)
    })
}


const generateRazorpay = (orderId,total) => {
    return new Promise((resolve, reject) => {
        var options={
            amount: total.total*100,
            currency: "INR",
            receipt:""+orderId
        };
        instance.orders.create(options,function(err,order){
            console.log("new order",order);
            resolve(order);
        })
        
    })
}
const verifyPayment=(details)=>{
    return new Promise(async(resolve,reject)=>{
        const crypto=require('crypto');
        const {
            createHmac
          } = await import('node:crypto');
        let hmac = createHmac('sha256', process.env.RAZORPAY_KEY);
        hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
        hmac=hmac.digest('hex')
        if(hmac==details['payment[razorpay_signature]']){
            resolve()
        }else{
            reject()
        }
    })

}
const changePaymentStatus=(orderId)=>{
  return new Promise((resolve,reject)=>{
    Order.updateOne({_id:orderId},{$set:{status:'ordered'}}).then(()=>{
        resolve()
    })
  })
// }
// const getSpSubcategory=(categoryId)=>{
//     return new Promise(async(resolve,reject)=>{
//     let subcat=await SubCatagory.find({catagory:categoryId}).populate('subcatagory').populate('catagory')
       
//             resolve(subcat)
    
//     })
}
module.exports = {
    doSignup,
    doLogin,
    verifyOTP,
    forgetPasswordEmailVerify,
    getUserResetPage,
    forgetPasswordOTP,
    updateNewPassword,
    getUserDetails,
    updateUser,
    addToCart,
    getCartProducts,
    getCartCount,
    changeProductQuantity,
    deleteCartProduct,
    getTotalAmount,
    placeOrder,
    getCartProductList,
    saveAddress,
    getAllAddress, getAddressDetails,
    getUserOrders, generateRazorpay,
    verifyPayment,changePaymentStatus,
   // getSpSubcategory


}