const express = require('express');
const router = express.Router();

const categoriesController = require('../controllers/categories.js'); //campground controllers
const {validateCategory} = require('../middleware.js');

//----------------------------ROUTES(/categories)-------------------------

router.get('/:category',validateCategory, categoriesController.categories);  //render new form

//---------------------------------------EXPORTS---------------------------------
//export router
module.exports = router;