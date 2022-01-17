//controller file for review model
const Review = require('../models/review.js');              //Review Model
const Restaurant = require('../models/restaurant.js');      //Restaurant model

//function to create a review
module.exports.createReview = async (req, res) => {
    const { id } = req.params;  //extract id from params
    const restaurant = await Restaurant.findById(id);   //find restaurant
    const review = await new Review(req.body.review);   //create new review
    review.author = req.user._id;   //author of review is the current user signed in
    await restaurant.reviews.push(review);  //push new review to associated restaurant
    await review.save();    //save review
    await restaurant.save();    //save restaurant
    req.flash('success', 'Successfully added a new review'); //new success flash
    res.redirect(`/restaurants/${id}`); //redirect to details page
}

//function to delete a review
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;    //get id and review id from params
    const restaurant = await Restaurant.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});    //delete review reference in restaurant document
    const review = await Review.findByIdAndDelete(reviewId);    //delete review
    req.flash('success', 'Successfully deleted review'); //new success flash
    res.redirect(`/restaurants/${id}`); //redirect to details page
}