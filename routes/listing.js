const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const { isLoggedIn } = require("../middleware.js")
const { isOwner,isAdmin } = require("../middleware.js")

const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
const upload = multer({storage})

const listingController = require("../controllers/listings.js")

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    throw new ExpressError(500, error);
  }
  else {
    next();
  }

}


router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post( 
    isLoggedIn,
    upload.single('listing[image]'),validateListing,
    wrapAsync(listingController.createListing));
    


//New route
router.get("/new", isLoggedIn, wrapAsync(listingController.renderNewForm))


router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(isLoggedIn, isOwner,upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing))



//Edit route

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm))



module.exports = router;