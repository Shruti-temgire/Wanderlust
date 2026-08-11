const mongoose=require("mongoose")
const Schema=mongoose.Schema
const Review=require("./review.js")

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    image:{
    url:String,
    filename:String,
},

    price:{
        type:Number,
    },
    location:{
        type:String,
    },
    country:{
        type:String,
    }, 
    geometry: {
    type: {
        type: String,
        enum: ["Point"],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
},
    reviews:[{
        type: Schema.Types.ObjectId,
        ref:"review",
}] ,
owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
},
category: {
    type: String,
    enum: [
        "trending",
        "rooms",
        "iconic cities",
        "mountains",
        "castles",
        "amazing pools",
        "camping",
        "farms",
        "arctic",
        "Boats",
        "Domes"
    ]
}


})
listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in:listing.reviews}})
    }
})
const Listing= mongoose.model("Listing",listingSchema);
module.exports=Listing;