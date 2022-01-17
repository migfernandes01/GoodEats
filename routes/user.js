const express = require('express');     //express package
const router = express.Router();        //router
const catchAsync = require('../utils/catchAsync.js')
const User = require('../models/user.js');  //user model
const passport = require('passport');

const userController = require('../controllers/user.js');  ////controller for users
const {validateUser, validateEmail} = require('../middleware.js');

//----------------------------RESTful ROUTES(/)-------------------------

router.get('/users/:user_id', validateUser, userController.showRestaurants);   //READ all restaurants submitted by a user

//------------------------------REGISTER----------------------------
router.route('/register')
    .get(userController.renderRegisterForm) //render register form
    .post(validateEmail, catchAsync(userController.registerUser))  //register user

//------------------------------LOGIN----------------------------
router.route('/login')
    .get(userController.renderLoginForm)    //render login form
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), userController.login)   //login route(passing throght passport middleware)(it authenticates in the middleware and enters the callback if user is authenticated)

//------------------------------LOGOUT----------------------------
//logout route
router.get('/logout', userController.logout);   //log user out

//--------------------------------EXPORTS------------------------------
//export router
module.exports = router;