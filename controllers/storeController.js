const { log } = require('console');
const model = require('../models/bikes');
const Offer = require('../models/offer');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

// GET /bike: send all products to the user
exports.index = (req, res,next)=>{
    model.find()
    .sort({price: 1})
    .then(products=>res.render('./bike/index', {products}))
    .catch(err=>next(err));
};

exports.search = async (req, res) => {
    let query = req.query.query;
    console.log(query);
    try {
        let products = await model.searchInventory(query); // Ensure this is awaited
        res.render('./bike/search', { products });
    } catch (error) {
        console.error("Error during search:", error);
        res.status(500).send("Error occurred during the search.");
    }
};

// GET bike/new: send user html form for creating a new bike listing
exports.new =  (req, res)=>{
    res.render('./bike/new');
};

// POST /bikes: send node the created bike
exports.create = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            // Check if the error is a Multer error
            if (err instanceof multer.MulterError) {
                // Handle file size limit error
                if (err.code === 'LIMIT_FILE_SIZE') {
                    const error = new Error('File size is too large. Please upload files less than 1MB.');
                    error.status = 400; // Bad Request
                    return next(error);
                }
                // Add more Multer error types here if needed

                // For other Multer errors, we can generalize the error response
                const error = new Error('File upload error.');
                error.status = 400; // Bad Request for all other Multer errors
                return next(error);
            }
            console.log(err.status);
            // For non-Multer errors, pass them to the next middleware
            return next(err);
        }
        if (!req.file) {
            let err = new Error('No file uploaded or file format is not supported.');
            err.status = 400; // Bad Request
            return next(err);
        }
        // File uploaded successfully, now create bike document
        const imagePath = `/images/${req.file.filename}`; // The path for the src attribute
        // Combine form data and imagePath to create bike document
        let bikeData = {
            ...req.body,
            seller: req.session.user,
            image: imagePath, 
            totalOffers: 0,
            active: true
        };
        let bike = new model(bikeData);
        bike.save()
            .then(() =>{
                req.flash('success', 'Your listing was created successfully');  
                res.redirect('/bike')
            }) 
            .catch((err) => {
                if (err.name === 'ValidationError') {
                    // Handle Mongoose validation errors
                    err.status = 400;
                }
                next(err);
            });
    });
};

// GET /bikes/:id: send details of bike identified by id
exports.show = (req, res, next)=>{
    let id = req.params.id;

    model.findById(id).populate('seller', ' firstName lastName')
    .then(bike=>{
        if(bike){
            return res.render('./bike/viewProduct', {bike});
        } else {
            let err = new Error('Cannot find a bike with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => {
        if (err.name === 'CastError') {
            // Handle cast errors for invalid ObjectId
            let castError = new Error('Invalid bike id ' + id);
            castError.status = 404;
            next(castError);
        } else {
            // Handle other possible errors
            next(err);
        }
    });
};

// UPDATE
// GET /bike/:id/edit: send html form for editing an existing bike
exports.edit = (req, res, next)=>{
    let id = req.params.id;

    model.findById(id)
    .then(bike=>{
        if(bike){
            return res.render('./bike/edit', {bike});
        } else {
            let err = new Error('Cannot find a bike with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => {
        if (err.name === 'CastError') {
            // Handle cast errors for invalid ObjectId
            let castError = new Error('Invalid bike id ' + id);
            castError.status = 404;
            next(castError);
        } else {
            // Handle other possible errors
            next(err);
        }
    }); 
};

// UPDATE
// PUT /bikes/:id:  update the bike identified by id
exports.update = (req, res, next)=>{
    upload(req, res, async (err) => {
        if (err) {
            // Check if the error is a Multer error
            if (err instanceof multer.MulterError) {
                // Handle file size limit error
                if (err.code === 'LIMIT_FILE_SIZE') {
                    const error = new Error('File size is too large. Please upload files less than 5MB.');
                    error.status = 400; // Bad Request
                    return next(error);
                }
                // Add more Multer error types here
                // For other Multer errors
                const error = new Error('File upload error.');
                error.status = 400; // Bad Request for all other Multer errors
                return next(error);
            }
            console.log(err.status);
            // For non-Multer errors, pass them to the next middleware
            return next(err);
        }
        const id = req.params.id;
        try {
            // Find the existing bike document
            let bikeToUpdate = await model.findById(id);
            if (!bikeToUpdate) {
                let castError = new Error('Invalid bike id ' + id);
                castError.status = 404;
                next(castError);
            }
            // If a new file is uploaded, update the imagePath
            if (req.file) {
                bikeToUpdate.image = `/images/${req.file.filename}`; 
            }
            // Update other fields
            Object.assign(bikeToUpdate, req.body);
            await bikeToUpdate.save();
            req.flash('success', 'You have successfully edited your listing');
            res.redirect('/bike/' + id); // Adjust the redirect URL as needed
        } catch (error) {
                console.log(error.name);
            if (error.name === 'ValidationError') {
                // Handle Mongoose validation errors
                error.status = 400;
            } else if (error.name === 'CastError') {
                // Handle cast errors for invalid ObjectId
                let castError = new Error('Invalid bike id ' + id);
                castError.status = 400;
                next(castError);
            } else if (error.name === 'TypeError') {
                // Handle type errors for invalid ObjectId
                let castError = new Error('Invalid bike id ' + id);
                castError.status = 404;
                next(castError);
            }else if (!error.status) {
                error.status = 500; // Internal Server Error for unspecified errors
            }
            next(error);
        }
    });
};

// DELETE /bikes/:id, delete the bike identified by id
exports.delete = (req, res, next) => {
    const id = req.params.id;

    // First find the bike to ensure it exists
    model.findById(id)
    .then(bike => {
        if (!bike) {
            let err = new Error('Cannot find a bike with id ' + id);
            err.status = 404;
            next(err);
            return;
        }

        // If the bike is found, first delete all associated offers
        Offer.deleteMany({ item: id })
        .then(() => {
            // After successfully deleting offers, delete the bike
            model.findByIdAndDelete(id)
            .then(() => {
                req.flash('success', 'Your listing and all associated offers were deleted successfully');
                res.redirect('/bike');
            })
            .catch(err => next(err));
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
};


// Multer storage engine configuration
const storage = multer.diskStorage({
    destination: './images', // Destination folder
    filename: function(req, file, cb) { // Filename configuration
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));// Create unique filename
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits:{fileSize: 5000000}, // Limits file size to 5MB
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('image'); // 'image' is the name attribute in form

// Check file type
function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null,true);
    } else {
        cb('Error: Images Only!');
    }
}