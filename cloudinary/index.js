const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//set config with data from the .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

//setting up an instance of CloudinaryStorage
const storage = new CloudinaryStorage({
    cloudinary, //configured cloudinary objects
    params: {   //parameters
        folder: 'GoodEats',
        allowedFormat: ['jpeg', 'png', 'jpg']
    }
});

//export config and storage instance
module.exports = {
    cloudinary,
    storage
};