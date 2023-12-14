const Listing = require("../models/listing")





module.exports.index = async (req, res) => {
    const{filter, query} = req.query;
  //  console.log(filter,"...",query);
    if (filter) {
        allListings = await Listing.find(filter ?{ propertyType: new RegExp(filter, 'i') }:{});
        return res.render("listings/index.ejs", { allListings });

    }
    else if(query)
    {
        const allListings = await Listing.find(query ? { country: new RegExp(query, 'i') } : {});
        return res.render("listings/index.ejs", { allListings });

    }
    else{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });

    }

    // const allListings = await Listing.find(query ? { country: new RegExp(query, 'i') } : {});
    // res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm = async (req, res) => {
    res.render("listings/new.ejs")
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" }
        })
        .populate("owner")
    //console.log("show");
    // console.log(listing);
    res.render("listings/show.ejs", { listing })

}

module.exports.createListing = async (req, res, next) => {

    let url = req.file.path;
    let filename = req.file.filename;
    // console.log(url, " ", filename);

    const newListing = new Listing(req.body.listing);
    //console.log(req.user);
    newListing.owner = req.user._id
    newListing.image = { url, filename };
    await newListing.save()
   // console.log(newListing);
    req.flash("success", "New Listing created");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    req.flash("success", "Listing edited");

    let orignalImageUrl = listing.image.url
    orignalImageUrl = orignalImageUrl.replace("/upload", "/upload/w_250,h_200")
    res.render("listings/edit.ejs", { listing, orignalImageUrl })

}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== 'undefined') {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save()
    }
    req.flash("success", "Listing updated");

    res.redirect(`/listings/${id}`);

}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    //console.log(deletedListing);
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
}