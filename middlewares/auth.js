const Bike = require('../models/bikes');

// check if user is guest
exports.isGuest = (req, res, next)=>{
    if(!req.session.user)
        return next();
    else{
        req.flash('error', 'you are logged in already');
        return res.redirect('/users/profile');
    }
}

// check if user is authenticated
exports.isLoggedIn = (req, res, next) =>{
    if(req.session.user)
        return next();
    else{
        req.flash('error', 'you must log in to continue');
        return res.redirect('/users/login');
    }
}

// check if user is author of the listing
exports.isAuthor = (req, res, next)=>{
    let id = req.params.id;
    Bike.findById(id)
    .then(bike=>{
        if(bike){
            if(bike.seller == req.session.user){
                return next();
            } else {
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        } else {
            let err = new Error('Cannot find a listing with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};