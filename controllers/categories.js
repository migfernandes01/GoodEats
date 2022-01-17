const Restaurant = require('../models/restaurant.js');  //Restaurant model

module.exports.categories = async (req, res) => {
    let {category} = req.params;  //extract category from params
    //First letter to Upper Case
    category = category.charAt(0).toUpperCase() + category.slice(1);
    //get restaurant from category
    if(category == "Vegan"){
        const restaurants = await Restaurant.find({vegan: true});
        res.render('categories.ejs', {category, restaurants});
    }else{
        const restaurants = await Restaurant.find({type: category});
        res.render('categories.ejs', {category, restaurants});
    }
}