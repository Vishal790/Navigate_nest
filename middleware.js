const Listing = require("./models/listing");
const Review = require("./models/review");
const {reviewSchema} = require("./schema.js");
const {listingSchema} = require("./schema.js");

module.exports.isLoggedIn = (req,res,next)=>{
   // console.log(req);
    //console.log(req.path, "..", req.originalUrl );
    if(!req.isAuthenticated()){
        //redirect url
        req.session.redirectUrl = req.originalUrl
        req.flash("error", "You must be logged in to create a new listing")
        return res.redirect("/login")
      }
      next();
}


module.exports.saveRedirectUrl = (req,res,next)=>{
  if(req.session.redirectUrl ){
    res.locals.redirectUrl = req.session.redirectUrl
  }
  next();
}


module.exports.isOwner=async (req,res,next)=>{
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (req.user.isAdmin) {
    return next(); // Admin can delete any listing
}

  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
}

module.exports.isReviewAuthor=async (req,res,next)=>{
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (req.user.isAdmin) {
    return next(); // Admin can delete any listing
}

  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
}


module.exports.validateReview = (req,res,next) =>{
  let {error} = reviewSchema.validate(req.body);
 
  if(error){
   throw new ExpressError(500, error);
  }
  else{
   next();
  }
 
 }
// middleware.js


