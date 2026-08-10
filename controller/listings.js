const Listing=require("../models/listing")

module.exports.index=async(req,res)=>{
  const allListings =await  Listing.find({})
  res.render("listings/index.ejs",{allListings});

}
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

module.exports.createListing=async(req,res,next)=>{
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success","new listing created")
    res.redirect("/listings")   
}

module.exports.renderEditForm=async(req,res)=>{
    let{id}=req.params;
  const listing= await Listing.findById(id);
  if(!listing){
    req.flash("error","listing you requested for does not exist ")
     return res.redirect("/listings");
  }
    res.render("listings/edit.ejs",{listing})
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true }
    );

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };

        await listing.save();
    }

    req.flash("success", "listing updated");
    res.redirect(`/listings/${id}`);
    console.log("BODY:", req.body);
console.log("FILE:", req.file);
};
module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deletedlisting= await Listing.findByIdAndDelete(id);
  
    req.flash("success","listing deleteed")
    res.redirect("/listings")
}