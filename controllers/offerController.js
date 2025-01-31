const { log } = require('console');
const Offer = require('../models/offer');
const Bike = require('../models/bikes');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

// GET /bike: send all products to the user


exports.makeOffer = async (req, res, next) => {
    const { itemId, amount } = req.body;

    Bike.findById(itemId)
    .then(bike =>{

      if (bike.seller.toString() === req.session.user) {
        let err = new Error('You can not make an offer on your own listing. ');
        err.status = 404;
        next(err);
      } else {
        const newOffer = Offer.create({
          user: req.session.user,
          item: itemId,
          amount: amount,
          title: bike.title
        });
        // Update item with the new offer
        bike.totalOffers = bike.totalOffers + 1;
        bike.highestOffer = Math.max(bike.highestOffer, amount);
        bike.save()
        .then(() =>{
            req.flash('success', 'Your listing was created successfully');  
            res.redirect(`/bike/${itemId}`);
        }) 
        .catch((err) => {
            if (err.name === 'ValidationError') {
                // Handle Mongoose validation errors
                err.status = 400;
            }
            next(err);
        });
          
        
      }
    })
    .catch(err => next(err));

  };


  exports.allOffers = (req, res, next) => {
    let id = req.params.id;

    Bike.findById(id)
    .then(bike => {
        if (!bike) {
            let err = new Error('Bike not found.');
            err.status = 404;
            next(err);
            return;
        }

        if (bike.seller.toString() !== req.session.user) {
            let err = new Error('You are not authorized to view this page.');
            err.status = 401;
            next(err);
            return;
        }

        // Fetch all offers associated with the bike
        Offer.find({ item: id })
        .populate('user')
        .populate('item')
        .then(offers => {
            res.render('offers/offers', { bike: bike, offers: offers });
        })
        .catch(err => {
            next(err);
        });
    })
    .catch(err => {
        next(err);
    });
};

exports.accept = async (req, res, next) => {
  const { id, offerId } = req.params;

  try {
      console.log(id);
      const bike = await Bike.findById(id);
      if (!bike) {
          return res.status(404).send('Bike not found');
      }

      if (bike.seller.toString() !== req.session.user) {
        let err = new Error('You are not authorized to view this page.');
        err.status = 401;
        next(err);
        return;
      }

      const offer = await Offer.findById(offerId);
      if (!offer) {
        let err = new Error('Offer not found');
        err.status = 404;
        next(err);
        return;
      }

      // Update the status of the accepted offer
      offer.status = 'accepted';
      await offer.save();

      // Set the bike as inactive
      bike.active = false;
      await bike.save();

      // Update the status of all other offers on this bike to rejected
      await Offer.updateMany(
          { item: id, _id: { $ne: offerId }, status: 'pending' },
          { status: 'rejected' }
      );

      req.flash('success', 'Offer accepted successfully. Bike is no longer available.');
      res.redirect(`/bike/${id}`);
  } catch (err) {
      console.error(err);
      next(err);
  }
};
