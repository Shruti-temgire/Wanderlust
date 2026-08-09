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


//show and update and delete
router.route("/:id")
.get(wrapasync(listingController.showListing))
.put(
    isLoggedIn,
    isOwner,
    validateListing,
    wrapasync(listingController.updateListing))

.delete(isLoggedIn,isOwner,wrapasync(listingController.destroyListing))


//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapasync(listingController.renderEditForm))

module.exports=router;