//require the Express module
const express = require('express');
// Set Controller
const controller = require('../controllers/storeController');
//create a router object
const router = express.Router();
// require nested route
const offerRoutes = require('./offerRoutes')

const{isLoggedIn} = require('../middlewares/auth');
const{isAuthor} = require('../middlewares/auth');
const{validated} = require('../middlewares/validator');
const{ validateBike, validateResult, validateSignup, validateLogin} = require('../middlewares/validator');


// GET /bike: send all products to the user
router.get('/', controller.index);

// GET /bike/search: get bikes according to query
router.get('/search', controller.search);

// GET bike/new: send user html form for creating a new bike
router.get('/new', isLoggedIn, controller.new);

// POST /bike: send node the created story
router.post('/', isLoggedIn, validateResult, controller.create);
//router.post('/', isLoggedIn, upload.single('image'), validateBike, validateResult, controller.create);

// GET /bike/:id: send details of bike identified by id
router.get('/:id', validated, controller.show);

// UPDATE
// GET /bike/:id/edit: send html form for editing an existing bike
router.get('/:id/edit', isLoggedIn, validated, isAuthor, controller.edit);

// UPDATE
// PUT /bike/:id:  update the bike identified by id
router.put('/:id', isLoggedIn, validated, isAuthor, validateResult, controller.update);

// DELETE / bike/:id, delete the bike identified by id
router.delete('/:id', isLoggedIn, validated, isAuthor, controller.delete);


// use the offerRoutes, bike is already included in this route
router.use('/:id/offer', offerRoutes);

//export the router object
module.exports = router;