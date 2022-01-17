const mongoose = require('mongoose');   //mongoose packages
const Schema = mongoose.Schema;         //constant referencing Schema method

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Review', reviewSchema);