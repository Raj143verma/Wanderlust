const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner,validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const Booking = require("../models/booking.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage: storage });  

router.get('/api/listings', async (req, res) => {
  try {
    const { category } = req.query;
    
    let filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    const listings = await Listing.find(filter).populate('owner');
    
    res.json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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

// Checkout Route
router.get("/:id/checkout", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("owner");
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    let { checkIn, checkOut, guests } = req.query;
    
    if (!checkIn || !checkOut) {
        req.flash("error", "Please provide valid dates.");
        return res.redirect(`/listings/${id}`);
    }

    let newCheckIn = new Date(checkIn);
    let newCheckOut = new Date(checkOut);

    if (newCheckOut <= newCheckIn) {
        req.flash("error", "Check-out date must be after check-in date.");
        return res.redirect(`/listings/${id}`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Normalize input dates for past date check
    const checkInNormalized = new Date(newCheckIn);
    checkInNormalized.setHours(0, 0, 0, 0);
    const checkOutNormalized = new Date(newCheckOut);
    checkOutNormalized.setHours(0, 0, 0, 0);

    if (checkInNormalized < today || checkOutNormalized < today) {
        req.flash("error", "Past date booking is not allowed.");
        return res.redirect(`/listings/${id}`);
    }

    // Overlapping booking logic
    const overlappingBooking = await Booking.findOne({
        listing: listing._id,
        bookingStatus: "confirmed",
        $and: [
            { checkIn: { $lt: newCheckOut } },
            { checkOut: { $gt: newCheckIn } }
        ]
    });

    if (overlappingBooking) {
        req.flash("error", "This listing is already booked for the selected dates.");
        return res.redirect(`/listings/${id}`);
    }

    let diffTime = Math.abs(newCheckOut - newCheckIn);
    let nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let totalPrice = listing.price * nights;

    res.render("listings/checkout.ejs", { 
        listing, 
        checkIn: newCheckIn.toDateString(), 
        checkOut: newCheckOut.toDateString(), 
        guests, 
        nights, 
        totalPrice,
        checkInRaw: checkIn,
        checkOutRaw: checkOut
    });
}));

// Create Booking
router.post("/:id/book", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    let { checkIn, checkOut, guests } = req.body;
    
    if (!checkIn || !checkOut) {
        req.flash("error", "Please provide valid dates.");
        return res.redirect(`/listings/${id}`);
    }

    let newCheckIn = new Date(checkIn);
    let newCheckOut = new Date(checkOut);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Normalize input dates for past date check
    const checkInNormalized = new Date(newCheckIn);
    checkInNormalized.setHours(0, 0, 0, 0);
    const checkOutNormalized = new Date(newCheckOut);
    checkOutNormalized.setHours(0, 0, 0, 0);

    if (checkInNormalized < today || checkOutNormalized < today) {
        req.flash("error", "Past date booking is not allowed.");
        return res.redirect(`/listings/${id}`);
    }

    // Overlapping booking logic
    const overlappingBooking = await Booking.findOne({
        listing: listing._id,
        bookingStatus: "confirmed",
        $and: [
            { checkIn: { $lt: newCheckOut } },
            { checkOut: { $gt: newCheckIn } }
        ]
    });

    if (overlappingBooking) {
        req.flash("error", "This listing is already booked for the selected dates.");
        return res.redirect(`/listings/${id}`);
    }

    const newBooking = new Booking({
        user: req.user._id,
        listing: listing._id,
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        bookingStatus: "confirmed"
    });
    await newBooking.save();
    req.flash("success", "Booking successful!");
    res.redirect(`/listings/${id}`);
}));

// Cancel Booking
router.delete("/:id/book", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Booking.findOneAndDelete({ user: req.user._id, listing: id });
    req.flash("success", "Booking cancelled!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;