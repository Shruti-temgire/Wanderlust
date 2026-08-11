const Listing=require("../models/listing")
const { config, geocoding } = require("@maptiler/client");

config.apiKey = process.env.MAP_KEY;

module.exports.index = async (req, res) => {
    const { category } = req.query;

    let allListings;

    if (category) {
        allListings = await Listing.find({ category: category });
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListings });
};  
module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs")
}

module.exports.showListing=async(req,res)=>{
  let{id}=req.params;
  const listing= await Listing.findById(id).populate({path:"reviews",populate:{path:"author"},}).populate("owner");
  if(!listing){
    req.flash("error","listing you requested for does not exist ")
     return res.redirect("/listings");
  }
  res.render("listings/show.ejs",{listing})
}


module.exports.createListing = async (req, res, next) => {
    try {
        // Get location entered by user
        let location = req.body.listing.location;

        // Forward Geocoding
        let response = await geocoding.forward(location);

        // Get coordinates
        let coordinates = response.features[0].geometry.coordinates;

        console.log("Location:", location);
        console.log("Coordinates:", coordinates);

        let url = req.file.path;
        let filename = req.file.filename;

        const newListing = new Listing(req.body.listing);

        newListing.owner = req.user._id;

        newListing.image = {
            url: url,
            filename: filename
        };

        newListing.geometry = {
            type: "Point",
            coordinates: coordinates
        };

        await newListing.save();

        req.flash("success", "New listing created");

        return res.redirect("/listings");

    } catch (err) {
        return next(err);
    }
};

module.exports.renderEditForm=async(req,res)=>{
    let{id}=req.params;
  const listing= await Listing.findById(id);
  if(!listing){
    req.flash("error","listing you requested for does not exist ")
     return res.redirect("/listings");
  }
  let originalImageUrl=listing.image.url
  originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250")
    res.render("listings/edit.ejs",{listing, originalImageUrl})
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true }
    );

    if (typeof req.file!=="undefined") {
         console.log("Image URL:", req.file.path);
        console.log("Image Filename:", req.file.filename);
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }

    req.flash("success", "listing updated");
    res.redirect(`/listings/${id}`);
   
};
module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deletedlisting= await Listing.findByIdAndDelete(id);
  
    req.flash("success","listing deleteed")
    res.redirect("/listings")
}