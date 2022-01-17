//REVIEWS ROUTES
const express = require('express');
const router = express.Router({mergeParams: true}); //import params

const catchAsync = require('../utils/catchAsync.js');       //catchAsync function

const {isLoggedIn, validateReview, isReviewAuthor} = require('../middleware.js'); //middleware functions

const reviewController = require('../controllers/review.js');  //controller for reviews

//----------------------------ROUTES(/campgrounds/:id/reviews)-------------------------

//---------------------CREATE------------------
//CREATE ROUTE(passing through an authentication and a validation middleware)
router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.createReview))

//---------------------DELETE------------------
//DELETE ROUTE(passing through a log-in authentication and an authrorization middleware)
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview))

//----------------------------EXPORTS-------------------------
//export router
module.exports = router;