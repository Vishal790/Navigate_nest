
if(process.env.NODE_ENV !="production"){
  require('dotenv').config()
  
}


const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require("method-override");
const Listing = require("./models/listing.js")
const dbUrl = process.env.ATLASDB_URL
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const { log } = require('console');
const Review = require("./models/review.js");
const { reviewSchema } = require("./schema.js");
const session = require("express-session")
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")
const passport = require("passport");
const LocalStratagy = require("passport-local");
const User = require("./models/user.js")




// Routes
const listingRouter = require("./routes/listing.js")
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")






app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")))
app.engine("ejs", ejsMate);



main()
  .then(() => { console.log("connected to databse"); })
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);

}


const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto: {
    secret : process.env.SECRET
  },
  touchAfter:24*3600,
})

store.on('error',()=>{
  console.log("error in mongo session store",err);
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires : Date.now()+ 7 *24 * 60 * 60 *1000,
    maxAge : 7 *24 * 60 * 60 *1000,
    httpOnly : true,
  }

}






app.get("/", (req, res) => {
  res.redirect("/listings")
})



app.use(session(sessionOptions));
app.use(flash())

//passport 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratagy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());







app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});





app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/",userRouter)





app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
})

//Error handling middleware

app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong" } = err;
  // res.status(status).send(message);
  res.render("error.ejs", { message })
})

app.listen(8080, () => {
  console.log("Listning to port 8080");
})

























// app.get("/testListing",async(req,res)=>{

//     let sampleListing  = new Listing({
//         title : "My home",
//         description : "By the beach",
//         price : 1200,
//         locaton : "Calangute, Goa",
//         country : "India",
//     })

//     //await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("Successful testing");

// })
