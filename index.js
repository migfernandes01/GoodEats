require('dotenv').config();

//IMPORTS
const express = require('express'); //express
const mongoose = require('mongoose'); //mongoose
const methodOverride = require('method-override') //method-override package
const ejsMate = require('ejs-mate');     //ejs-mate package
const path = require('path');           //path package
const session = require('express-session'); //session package
const flash = require('connect-flash'); //flash package
const passport = require('passport');   //passport package
const LocalStrategy = require('passport-local');    //passport-local package
const MongoStore = require('connect-mongo');   //package to manage session wiht mongo
const mongoSanitize = require('express-mongo-sanitize');    //anti mongo-injection package
const helmet = require('helmet');   //security package

//import modules
const User = require('./models/user.js');

//import routers
const restaurantRoutes = require('./routes/restaurant.js');
const categoriesRoutes = require('./routes/categories.js');
const userRoutes = require('./routes/user.js');
const reviewRoutes = require('./routes/review.js');

//import error handling utils
const ExpressError = require('./utils/ExpressError.js');

//--------APP SETS AND USES----------------------

//run express
const app = express();

//parse body request for post methods
app.use(express.urlencoded({extended: true}));

//set query for method override
app.use(methodOverride('_method'));

//set engine to ejsMate
app.engine('ejs', ejsMate);

//set ejs as view engine and path to relative
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//serve static assests on public directory
app.use(express.static(path.join(__dirname, 'public')));

//use flash
app.use(flash());

const dbURL = process.env.DB_URL || "mongodb://localhost:27017/good-eats";  //set DB URL to the one in .env
const secret = process.env.SECRET || 'secret';  //set secret to the one in .env
const port = process.env.PORT || 3000;  //set correct port or use port 3000


//store config to our dbURL
const store = MongoStore.create({
    mongoUrl: dbURL,
    secret,
    touchAfter: 24 * 60 * 60//in seconds
});

//if there's an error on store
store.on('error', function(e){
    console.log("SESSION STORE ERROR", e);
});

//session config and use(use db to store sessions data)
const sessionConfig = {
    store,  //store it on store
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date().now + 1000 * 60 * 60 * 24 * 7,   //expires in a week from now(in ms)
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
//use session with config
app.use(session(sessionConfig));

app.use(mongoSanitize());//use mongoSanitize to avoid mongo injection

//use helmet for web security
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://fonts.googleapis.com/"
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
    "https://fonts.gstatic.com",
    "https://cdn.jsdelivr.net"
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    }),
    helmet.crossOriginResourcePolicy()
);

//initialize and use passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));   //use LocalStrategy method from passport-local-mongoose to authenticate Users
passport.serializeUser(User.serializeUser());       //how to serailize user
passport.deserializeUser(User.deserializeUser());   //how to deserailize user

//Flash middleware(global variables)
app.use((req, res, next) => {
    res.locals.success = req.flash('success');    //get success flash
    res.locals.error = req.flash('error');    //get success flash
    res.locals.currentUser = req.user;      //current user obj(undefined if no user is logged in)
    next();
})


/*-----------DB CONNECTION-----------------*/

//connect mongoose to mongoDB
mongoose.connect(dbURL);
const db = mongoose.connection;
//display error message or success message
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("Database connected");
});

/*---------------PORT LISTEN----------------*/

//listen to correct port
app.listen(port, () => {
    console.log(`LISTENING ON PORT ${port}...`);
});


/*--------------------RESTful Routes-------------*/
//HOME PAGE
app.get('/', (req, res) => {
    res.render('home.ejs');
});

//ROUTERS
app.use('/', userRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/categories', categoriesRoutes);
app.use('/restaurants/:id/reviews', reviewRoutes);

//Invalid Page route
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404)); //pass new 404 error to next middleware 
});

//ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
    const { statusCode = 500} = err;   //extract status code from error(500 as default)
    if(!err.message) err.message = 'Oh no, something went wrong!';  //setting default message
    res.status(statusCode).render('error.ejs', { err });    //render error page passing the error
});