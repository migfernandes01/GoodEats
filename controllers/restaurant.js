const Restaurant = require('../models/restaurant.js');  // restaurant model 
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');  //geocoding package
const { cloudinary } = require('../cloudinary/index.js');   //cloudinary file

//env variable for mapbox
const mapBoxToken = process.env.MAPBOX_TOKEN;

//pass token mapbox 
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

//function to create a escapeRegex
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//function to render index of restaurants
module.exports.index = async (req, res) => {
    //extract params
    const {name, price, vegan, type} = req.query;

    //if any filter is selected, filter restaurants
    if(name){
        const regex = new RegExp(escapeRegex(name), 'gi');
        const restaurants = await Restaurant.find({name: regex});  //get all campgrounds
        res.render('restaurant/index.ejs', {restaurants});//render campgrounds page
    }
    if(price){
        const restaurants = await Restaurant.find({price: price});
        res.render('restaurant/index.ejs', {restaurants});
    }
    if(type){
        let cousine =  type.filter(e =>  e);  //remove empty string from array
        cousine = cousine.map( a => a.charAt(0).toUpperCase() + a.substr(1) );
        console.log(cousine);
        const restaurants = await Restaurant.find({type: {$in: cousine}});
        res.render('restaurant/index.ejs', {restaurants});
    }
    if(vegan){
        const restaurants = await Restaurant.find({vegan: vegan});
        res.render('restaurant/index.ejs', {restaurants});
    }
    else{
        const restaurants = await Restaurant.find({});
        res.render('restaurant/index.ejs', {restaurants});
    }
};

//function to create restaurant
module.exports.createRestaurant = async (req, res, next) => {
    //convert vegan field to boolean
    //set vegan value
    if(req.body.restaurant.vegan == "true"){
        req.body.restaurant.vegan = true;
    }else{
        req.body.restaurant.vegan = false;
    }
    if(req.body.restaurant.price == null){
        req.flash('error', 'Please select price range');
        res.redirect('/restaurants/new');
    }
    //convert type to array of strings
    req.body.restaurant.type = req.body.restaurant.type.split(" ").map(String);
    //delete any empty elements from array
    req.body.restaurant.type = req.body.restaurant.type.filter(function(f) { return f !== '' });

    //get geo data
    const geoData = await geocoder.forwardGeocode({ 
        query: req.body.restaurant.location,
        limit: 1
    }).send()
    //create new restaurant
    const restaurant = new Restaurant(req.body.restaurant);
    //set geodata into db field
    restaurant.geometry = geoData.body.features[0].geometry;    
    //set img field on restaurant model to req.files info
    restaurant.images = req.files.map(file => ({url: file.path, filename: file.filename})); 
    //set author as the current user logged in
    restaurant.author = req.user._id;    
    //save new restaurant
    await restaurant.save();

    //flash and redirect
    req.flash('success', 'Successfully added a new restaurant'); //new success flash
    res.redirect(`/restaurants/${restaurant._id}`);
};

//function to render new form
module.exports.renderNewForm = (req, res) => {
    res.render('restaurant/new.ejs');  //render new form
};

//function to show restaurant details
module.exports.restaurantDetails = async (req, res) => {
    const { id } = req.params;  //extract id from req params
    const restaurant = await Restaurant.findById(id).populate({
        path: 'reviews',    //populate all the reviews
        populate: {
            path: 'author'  //populate author for each review
        }}).populate('author');   //papulate author of restaurant
    if(!restaurant){
        req.flash('error', 'Cannot find that restaurant!'); //new error flash
        return res.redirect('/restaurants');        //redirect to /restaurants page
    }else{
        res.render('restaurant/details.ejs', {restaurant}); //render details page
    }
};

//function to update restaurant
module.exports.updateRestaurant = async (req, res) => {
    const { id } = req.params;  //extract id from params
    //set vegan value
    if(req.body.restaurant.vegan == "true"){
        req.body.restaurant.vegan = true;
    }else{
        req.body.restaurant.vegan = false;
    }

    //convert type to array od strings
    req.body.restaurant.type= req.body.restaurant.type.split(" ").map(String);
    //delete any empty elements from array
    req.body.restaurant.type = req.body.restaurant.type.filter(function(f) { return f !== '' });

    //find restaurant and update with req body
    const restaurant = await Restaurant.findByIdAndUpdate(id, {...req.body.restaurant});
    //get geo data
    const geoData = await geocoder.forwardGeocode({
        query: req.body.restaurant.location,
        limit: 1
    }).send()
    //set geodata into db field
    restaurant.geometry = geoData.body.features[0].geometry;    
    const imgs = req.files.map(file => ({url: file.path, filename: file.filename})); //set imgs array to req.files data
    restaurant.images.push(...imgs); //push images to array

    if(req.body.deleteImages){  //if user selected any image for deletion
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);    //delete image in cloudinary
        }
        await restaurant.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});   //delete image in mongoDB
    }

    //save restaurant
    await restaurant.save();
    res.redirect(`/restaurants/${id}`); //redirect to details page
};

//function to delete restaurant
module.exports.deleteRestaurant = async (req, res) => {
    const { id } = req.params;   //extract id from params
    const restaurant = await Restaurant.findByIdAndDelete(id);  //delete restaurant with id
    res.redirect('/restaurants');   //redirect to campgrounds page
};

//function to render edit form
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;   //extract id from params
    const restaurant = await Restaurant.findById(id);
    res.render('restaurant/edit.ejs', {restaurant});
};