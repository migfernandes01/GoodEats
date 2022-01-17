//imports
const mongoose = require('mongoose');                   //mongoose package
const Restaurant = require('../models/restaurant');     //restaurant model
const {places, descriptors} = require('./seedHelpers.js');//file with data
const cities = require('./cities.js');                  //file with array of cities

//connect mongoose to mongoDB
mongoose.connect('mongodb://localhost:27017/good-eats');
const db = mongoose.connection;

//display error message or success message
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("Database connected");
});

//function to get random item out of an array
const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)]
}

const seedDb = async () => {
    await Restaurant.deleteMany({});    //delete everything
    /*for(let i = 0; i < 100; i++){    //10 times
        const random1000 = Math.floor(Math.random() * 1000); //get random nr(1-1000)
        const restaurant = new Restaurant({
            author: '61d8afbb551e4bdc907318d5',
            name: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Architecto, beatae ut! Natus illo hic iure ad voluptates? Consectetur, dolor cupiditate quia ad, sequi ullam tempore recusandae, architecto mollitia hic veritatis!',
            price: "High Price($25-$45)",
            vegan: false,
            images:  [
                {
                    url: 'https://res.cloudinary.com/dqvounney/image/upload/v1641658628/GoodEats/-1x-1_w2iizd.jpg',
                    filename: 'GoodEats/-1x-1_w2iizd'
                  },
                  {
                    url: 'https://res.cloudinary.com/dqvounney/image/upload/v1641658628/GoodEats/Tallest_Restaurants_in_the_World_7_fvj9js.webp',
                    filename: 'GoodEats/Tallest_Restaurants_in_the_World_7_fvj9js'
                  }
                
            ],
            geometry: {
                type : "Point", 
                coordinates : [
                        cities[random1000].longitude,
                        cities[random1000].latitude
                    ] 
            }
        });
        restaurant.type.push('Greek', 'American');
        await restaurant.save();  //save new campground
    }*/
    console.log("Successful DB seed");
};

//call seedDb function(returns a promise(then/catch))
seedDb()
    .then(() => {
        console.log("Database Seeded Successfully, closing connection...");
        mongoose.connection.close();    //close DB
    })
    .catch( e => {
        console.log("Error seeding database");
        mongoose.connection.close();    //close DB
    })