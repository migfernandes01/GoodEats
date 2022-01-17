const express = require('express');
const multer = require('multer');   //multer package
const router = express.Router();
const { storage } = require('../cloudinary/index.js');  //cloudinary config
const upload = multer({ storage }); //set multer to use storage we imported from cloudinary file

const {isAuthor, isLoggedIn, validateRestaurant} = require('../middleware.js');

const catchAsync = require('../utils/catchAsync.js');       //catchAsync function

const restaurantController = require('../controllers/restaurant.js'); //campground controllers

//----------------------------ROUTES(/restaurants)-------------------------

router.route('/')
    .get(catchAsync(restaurantController.index))    //see all restaurants
    .post(isLoggedIn, upload.array('restaurant[images]'), validateRestaurant, catchAsync(restaurantController.createRestaurant))    //CREATE a restaurant

//-------------------CREATE(/restaurants/new)------------------
//CREATE form
router.get('/new',isLoggedIn, restaurantController.renderNewForm);  //render new form

//      /restaurants/:id
router.route('/:id')
    .get(catchAsync(restaurantController.restaurantDetails))    //READ specific restaurant by id
    .patch(isLoggedIn, isAuthor, upload.array('restaurant[images]'), validateRestaurant, catchAsync(restaurantController.updateRestaurant)) //UPDATE ROUTE(passing through an authentication, authorization and a validation middleware)
    .delete(isLoggedIn, isAuthor, catchAsync(restaurantController.deleteRestaurant))    //DELETE ROUTE(passing through an authentication and authorization middleware and a mongoose middleware)

router.get('/:id/edit', isLoggedIn, isAuthor, restaurantController.renderEditForm)  //render edit form


//---------------------------------------EXPORTS---------------------------------
//export router
module.exports = router;