const Restaurant = require('./models/restaurant.js');       //restaurant model
const Review = require('./models/review.js');       //restaurant model
const User = require('./models/user.js');       //restaurant model
const { reviewSchema } = require('./joiSchemas.js');      //JOI schemas
const ExpressError = require('./utils/ExpressError.js');    //ExpressError

const ObjectId = require('mongodb').ObjectId;

//middleware to verify session
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){ //if user is not authrenticated
        req.session.returnTo = req.originalUrl; //store path they were when they tried to perform an action
        req.flash('error', 'Please sign in to perform that action');    //new error flash
        return res.redirect('/login');  //redirect to login
    }
    next();
}

//Joi middleware campground validation
module.exports.validateRestaurant = (req, res, next) => {
    console.log(req.body.restaurant);
    if(req.body.restaurant.name == ""){
        req.flash('error', "Please insert the restaurant's name");
        if(req.originalUrl == "/restaurants"){
            res.redirect('/restaurants/new');
        }else{
            const path = req.originalUrl.replace('?_method=PATCH', 'edit')
            res.redirect(path);
        }
    }
    if(req.body.restaurant.location == ""){
        req.flash('error', "Please insert the restaurant's location");
        if(req.originalUrl == "/restaurants"){
            res.redirect('/restaurants/new');
        }else{
            const path = req.originalUrl.replace('?_method=PATCH', 'edit')
            res.redirect(path);
        }
    }
    if(req.body.restaurant.price == null){
        req.flash('error', 'Please select price');
        if(req.originalUrl = "/restaurants"){
            res.redirect('/restaurants/new');
        }else{
            const path = req.originalUrl.replace('?_method=PATCH', 'edit')
            res.redirect(path);
        }
    }
    else if(req.body.restaurant.type == ""){
        req.flash('error', 'Please select at least one cuisine type');
        if(req.originalUrl == "/restaurants"){
            res.redirect('/restaurants/new');
        }else{
            const path = req.originalUrl.replace('?_method=PATCH', 'edit')
            res.redirect(path);
        }
    }
    else if(req.body.restaurant.description == " "){
        req.flash('error', 'Please insert a description');
        if(req.originalUrl == "/restaurants"){
            res.redirect('/restaurants/new');
        }else{
            const path = req.originalUrl.replace('?_method=PATCH', 'edit')
            res.redirect(path);
        }
    }else{
        next();
    }
}

//Middleware to verify if user is the author
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;   //get id from params
    const restaurant = await Restaurant.findById(id);
    if(!restaurant.author.equals(req.user._id)){ //if current user is not the author of the campground
        req.flash('error', 'You do not have permission to do that!');   //new error flash
        return res.redirect(`/restaurants/${id}`);  //redirect to details page
    }
    next();
}

//Joi middleware review validation
module.exports.validateReview = (req, res, next) => {
    //if(!req.body.review) throw new ExpressError('Invalid Review', 400);  //throw 400 error and pass it to next middleware
    const { error } = reviewSchema.validate(req.body); //extract error out of body request
    if(error){  //if there's an error in the request body throw new ExpressError
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }else{  //if everything is okay, go to next middleware
        next();
    }
}

//Middleware to verify if user is the author
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;   //get id and reviewId from params
    const review = await Review.findById(reviewId); //get review with reviewId
    if(!review.author.equals(req.user._id)){ //if current user is not the author of the review
        req.flash('error', 'You do not have permission to do that!');   //new error flash
        return res.redirect(`/restaurants/${id}`);  //redirect to details page
    }
    next();
}

module.exports.validateUser = async (req, res, next) => {
    const {user_id} = req.params;
    const o_id = new ObjectId(user_id);
    const user = await User.find({_id: o_id});
    console.log(user);
    if(user.length === 0){
        const err = new ExpressError('User Not Found', 404);
        res.render("error.ejs" , {err});
    }else{
        res.locals.o_id = o_id;
        res.locals.user = user
        next();
    }
}

module.exports.validateCategory = (req, res, next) => {
    const { category } = req.params;
    const validCategories = ["american", "japanese", "chinese", "greek", "latin", "italian", "healthy", "indian", "vegan"];
    if(validCategories.includes(category)){
        next();
    }else{
        const err = new ExpressError('Category Not Found', 404);
        res.render("error.ejs" , {err});
    }
}

module.exports.validateEmail = (req, res, next) => {
    const {email} = req.body;
    const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (email.match(mailFormat))
    { 
        next();
    }else{
        req.flash('error', 'Please insert a valid e-mail');   //new error flash
        return res.redirect(`/register`);  //redirect to details page
    }
}