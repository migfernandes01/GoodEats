//controller file for user model
const Restaurant = require('../models/restaurant.js');   //restaurant model
const User = require('../models/user.js');              //user model

const ObjectId = require('mongodb').ObjectId;

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports.showRestaurants = async (req, res) => {
    //get user and o_id from locals
    const user = res.locals.user;
    const o_id = res.locals.o_id;
    //get constants from query
    const {name, price, vegan, type} = req.query;
    //apply filters if it's the case or show restaurants for a user
    if(name){
        const regex = new RegExp(escapeRegex(name), 'gi');
        const restaurants = await Restaurant.find({author: o_id, name: regex});  //get all campgrounds
        res.render('user/showRestaurant.ejs', {user, restaurants});//render campgrounds page
    }
    if(price){
        const restaurants = await Restaurant.find({author: o_id, price: price});
        res.render('user/showRestaurant.ejs', {user, restaurants});
    }
    if(type){
        let cousine =  type.filter(e =>  e);  //remove empty string from array
        cousine = cousine.map( a => a.charAt(0).toUpperCase() + a.substr(1) ); //get first characters to upper case
        const restaurants = await Restaurant.find({author: o_id, type: {$in: cousine}});
        res.render('user/showRestaurant.ejs', {user, restaurants});
    }
    if(vegan){
        const restaurants = await Restaurant.find({author: o_id, vegan: vegan});
        res.render('user/showRestaurant.ejs', {user, restaurants});
    }
    else{
        const restaurants = await Restaurant.find({author: o_id});
        res.render("user/showRestaurant.ejs", { user, restaurants });
    }       
}

//function to render register form
module.exports.renderRegisterForm = (req, res) => {
    res.render('user/register.ejs');
}

//function to register a user
module.exports.registerUser = async (req, res, next) => {
    try{    //try register
        const {email, username, password} = req.body;   //extract username,pw and email from request body
        const user = new User({email, username});   //create new user without pw
        const registeredUser = await User.register(user, password); //create new user with hashed pw and salt 
        req.login(registeredUser, err => {  //log new user in and check for errors
            if(err) return next(err);
            req.flash("success", "Welcome to GoodEats");   //new flash
            res.redirect("/restaurants");       //redirect
        });
    }catch(e){  //catch any error(such as existing username)
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

//function to render login form
module.exports.renderLoginForm = (req, res) => {
    res.render('user/login.ejs');
}

//function to login (do that after passport login)
module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');  //new success flash
    const returnUrl = req.session.returnTo || '/restaurants';   //get url were request was made or set it to /restaurants
    delete req.session.returnTo;    //delete session data
    res.redirect(returnUrl);   //redirect to returnUrl
}

//function to log a user out
module.exports.logout = (req, res) => {
    req.logout();   //passport method to logout
    req.flash('success', 'Goodbye!');   //new success flash
    res.redirect('/restaurants');   //redirect
}