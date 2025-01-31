const {body} = require('express-validator');
const {validationResult} = require('express-validator');

exports.validated = (req, res, next)=>{
    let id = req.params.id;
    //an objectId is a 24-bit Hex string
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid Bike id');
        err.status = 400;
        return next(err);
    } else {
        return next();
    }
};

exports.validateSignup = [
    body('firstName', 'first name cannot be empty').notEmpty().trim().escape(),
    body('lastName', 'last name can not be empty').notEmpty().trim().escape(),
    body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
    body('password', 'password must be at least 8 characters and at most 64 characters').isLength({min: 8, max: 64})
];

exports.validateLogin = [
    body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
    body('password', 'password must be at least 8 characters and at most 64 characters').isLength({min: 8, max: 64})
];

exports.validateResult = (req, res, next) =>{
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array()); // Log errors for debugging

        errors.array().forEach(error=>{
            req.flash('error', error.msg);
        })
        return res.redirect('back');
    } else {
        return next();
    }
};


exports.validateBike = [
    body('title', 'Title cannot be empty').notEmpty().trim().escape(),
    body('condition', 'Invalid condition value').notEmpty().trim().escape()
        .isIn(['New', 'Used', 'Parts Only', 'Like New', 'Fair']),
    body('price', 'Price must be a number greater than 0').isFloat({ min: 0.01 }),
    body('details', 'Details must be at least 10 characters').isLength({ min: 10 }).trim().escape(),
];
// all fields coming back as undefined... likely because multer needs to handle the body before the validation function can access the body
// do not have time to implement unfortunately