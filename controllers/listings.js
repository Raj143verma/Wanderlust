const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req,res) =>{
const allListings = await Listing.find({});
res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    
    let hasBooked = false;
    if (req.user) {
        const booking = await Booking.findOne({ user: req.user._id, listing: listing._id, bookingStatus: "confirmed" });
        if (booking) hasBooked = true;
    }
    
    console.log(listing);
    res.render("listings/show.ejs",{listing, hasBooked});
   };

   module.exports.createListing = async (req, res) => {
   let response = await geocodingClient
.forwardGeocode({
  query:  req.body.listing.location,
  limit: 1
})
  .send();
  
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
     req.flash("success", "Successfully created a new listing!");
     res.redirect("/listings");
      };


module.exports.renderEditForm = async (req, res) => {
       let { id } = req.params;
       const listing = await Listing.findById(id);
       if (!listing) {
            req.flash("error", "Listing you requested for does not exist!");
           return res.redirect("/listings");
       }
       let originalImageUrl = listing.image.url;
       originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
       res.render("listings/edit.ejs",{listing, originalImageUrl});
   };

module.exports.updateListing = async (req, res) => {
   let { id } = req.params;     
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
    }
   req.flash("success", "Successfully updated the listing!");
   res.redirect(`/listings/${id}`);
   };

module.exports.deleteListing = async (req, res) => {
   let { id } = req.params;
   let deleteListing = await Listing.findByIdAndDelete(id);
   console.log(deleteListing);
   req.flash("success", "Successfully deleted the listing!");
   res.redirect("/listings");
   };