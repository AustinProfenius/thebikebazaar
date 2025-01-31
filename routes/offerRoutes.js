/*
GET view all offers for bike with id {:id}
/bike/:id/offer

POST make an offer on bike with id {:id}
/bike/:id/offer

PUT accept an offer on bike {:id} with offer {:id}
/bike/:id/ofer/:id
*/
const express = require('express');
const router = express.Router({mergeParams: true});
const controller = require('../controllers/offerController');

const{isLoggedIn} = require('../middlewares/auth');
const{isAuthor} = require('../middlewares/auth');
const{validated} = require('../middlewares/validator');


// GET view all offers for bike with id {:id}
router.get('/', isLoggedIn, isAuthor, validated, controller.allOffers);

// POST make an offer on bike with id {:id}
router.post('/make', validated, isLoggedIn, controller.makeOffer);

// PUT accept an offer on bike {:id} with offer {:id}
router.put('/:offerId', isLoggedIn, validated, isAuthor, controller.accept);

//export the router object
module.exports = router;

