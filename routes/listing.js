const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner,validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage: storage });  



router
.route("/")
.get(wrapAsync(listingController.index))
.post(
  isLoggedIn,
  upload.single('listing[image]'),
  (req, res, next) => {
    if (!req.body.listing) req.body.listing = {};
    if (req.file) {
      req.body.listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }
    next();
  },
  validateListing,
  wrapAsync(listingController.createListing)
);


//New Route
  router.get("/new", isLoggedIn, listingController.renderNewForm);



router
.route("/:id")
.get(wrapAsync(listingController.showListing))
 .put(
   isLoggedIn,
   isOwner,
   upload.single('listing[image]'),
   wrapAsync(async (req, res, next) => {
     if (!req.body.listing) req.body.listing = {};
     if (req.file) {
       req.body.listing.image = {
         url: req.file.path,
         filename: req.file.filename,
       };
     } else {
       let listing = await Listing.findById(req.params.id);
       if (listing) req.body.listing.image = listing.image;
     }
     next();
   }),
   validateListing,
   wrapAsync(listingController.updateListing)
 )
.delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));


//New Route
  router.get("/new", isLoggedIn, listingController.renderNewForm);


   //Edit Route
   router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));
   
  
   

module.exports = router;