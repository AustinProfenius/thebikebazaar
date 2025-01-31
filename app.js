// require modules
const express = require('express');
const morgan = require('morgan');
const storeRoutes = require('./routes/storeRoutes');
const userRoutes = require('./routes/userRoutes');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
// MV8dibJC7Mudm4fR

// create application
const app = express();

//configure app
let port = 3000;
let host = 'localhost';
//let url = 'mongodb://localhost:27017/demos'; 
const url = "mongodb+srv://pro162:MV8dibJC7Mudm4fR@cluster0.gnujpnt.mongodb.net/nbda-project3?retryWrites=true&w=majority&appName=Cluster0";

app.set('view engine', 'ejs');

//connect to MongoDB
mongoose.connect(url)
.then(()=>{
    //start the server
    app.listen(port, host, ()=>{
        console.log('server is up and running on port', port);
    });
})
.catch(err =>console.log(err.message));

// mount middleware
app.use(
    session({
        secret: "ajfeirf90aeu9eroejfoefj",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/demos'}),
        cookie: {maxAge: 60*60*1000}
        })
);

app.use(flash());

app.use((req, res, next) => {
    //console.log(req.session);
    res.locals.user = req.session.user||null;   // if no user in session than null
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

app.use(express.static('public'));              // be able to search static files, stile sheets, images
app.use(express.urlencoded({extended: true}));  // allow you to parse data in request body 
app.use(morgan('tiny'));
app.use('/images', express.static('images'));
app.use(methodOverride('_method'));


//set up routes
app.get('/', (req, res)=>{
    res.render('index');
});

app.use('/bike', storeRoutes);

app.use('/users', userRoutes);



// errors  

app.use((req, res, next)=>{
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
})

app.use((err, req, res, next) => {
    if(!err.status){
        err.status = 500;
        err.message = ("internal server error");
    }
    res.status(err.status);
    res.render('error', {error:err});
    console.log(err);
});

