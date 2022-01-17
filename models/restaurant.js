const mongoose = require('mongoose');   //mongoose packages
const Schema = mongoose.Schema;         //constant referencing Schema method
const Review = require('./review.js');  //review model

//pass virtuals when json.stringifying (used for cluster map)
const opts = { toJSON: { virtuals:true } };

//schema for images
const ImageSchema = new Schema({
    url: String,
    filename: String
});

//use a virtual to set url for thumbnail
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200');
});

//create new Schema
const RestaurantSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    geometry: { //geoJSON
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: {
        type: String,
        required: true
    },
    type: [
        {
            type: String,
            required: true,
            enum: ["American", "Japanese", "Chinese", "Greek", "Latin", "Italian", "Healthy", "Indian"]
        }
    ],
    price: {
        type: String,
        required: true,
        enum: ['Low Price($10 or less)', 'Medium Price($10-$25)', 'High Price($25-$45)', 'Exquisite Price($45 or more)']
    },
    vegan: {
        type: Boolean,
        required: false,
        default: false
    },
    images: [ ImageSchema ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review' 
        }
    ]
}, opts);

//virtual to set popup text on cluster map
RestaurantSchema.virtual('properties.popUpMarkup').get(function(){
    return `<strong><h5><a href="/restaurants/${this._id}">${this.name}</a></h5><strong><br><p>Cuisine: ${this.type}</p>`;
});

//post delete middleware to delete associated reviews
RestaurantSchema.post('findOneAndDelete', async function(restaurant) {
    if(restaurant){ //if campground was found
        await Review.remove({   //remove reviews with id found in campground.reviews
            _id: {
                $in: restaurant.reviews
            }
        });
    }
});

//create model using schema and export it
module.exports = mongoose.model('Restaurant', RestaurantSchema);