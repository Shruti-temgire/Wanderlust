if(process.env.NODE_ENV!="production"){
    require('dotenv').config()
}

const express=require("express")
const app = express();

app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

const mongoose = require("mongoose");
const app=express();
const mongoose=require("mongoose")
const path = require("path")
const methodOverride=require("method-override")
const ejsMate=require("ejs-mate");
const expresserror=require("./utils/expresserror.js")
const session=require ("express-session")
const { MongoStore } = require("connect-mongo");
const flash=require("connect-flash")
const passport=require("passport")
const LocalStrategy=require("passport-local")
const User= require("./models/user.js")
const port = process.env.PORT || 8080;
const Review=require("./models/review.js")


const listingRouter =require("./routes/listing.js")
const reviewRouter=require("./routes/review.js")
const userRouter=require("./routes/user.js")



app.engine('ejs',ejsMate);
app.set("view engine","ejs")
app.set("views", path.join(__dirname,"views"))
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")))

const dburl=process.env.ATLASDB_URL;

main().then(()=>{
    console.log("connected to db")
}).catch((err)=>{
    console.log(err)
})
async function main(){
    await mongoose.connect(dburl)
}

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",")
        throw new expresserror(400,errMsg)
    }else{
        next();
    }
}

const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error",()=>{
    console.log("error in mongo session store",err)
})

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
    
}
// app.get("/",(req,res)=>{
//     res.send("i i am root")
// })


app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success")
    res.locals.error=req.flash("error")
    res.locals.currUser=req.user;
    next()
})



app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter)

app.all("/{*splat}", (req, res, next) => {
    next(new expresserror(404, "page not found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500 } = err;

    res.status(statusCode).render("error.ejs", { err });
});



app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on port ${port}`);
});