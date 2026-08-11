const express= require("express")
const router =express.Router()
const wrapasync=require("../utils/wrapasync.js")
const Listing=require("../models/listing.js")
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js")
const listingController=require("../controller/listings.js")
const multer  = require('multer')
const {storage}=require("../cloudConfig.js")
const upload = multer({storage })

//index and create 
router.route("/")
.get(wrapasync(listingController.index))
.post(
    isLoggedIn,
    upload.single('listing[image]'),
    validateListing,
    wrapasync(listingController.createListing)
)

//create new routes
router.get("/new", isLoggedIn,listingController.renderNewForm)
// SEARCH ROUTE
router.get("/search", wrapasync(async (req, res) => {
    const destination = req.query.destination || "";

    const allListings = await Listing.find({
        $or: [
            { country: { $regex: destination, $options: "i" } },
            { location: { $regex: destination, $options: "i" } }
        ]
    });

    if (allListings.length === 0) {
        return res.render("listings/index.ejs", {
            allListings: [],
            searchError: "Not a valid destination"
        });
    }

    res.render("listings/index.ejs", {
        allListings,
        searchError: null
    });
}));


//show and update and delete
router.route("/:id")
.get(wrapasync(listingController.showListing))
.put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapasync(listingController.updateListing)
)

.delete(isLoggedIn,isOwner,wrapasync(listingController.destroyListing))


//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapasync(listingController.renderEditForm))

module.exports=router;