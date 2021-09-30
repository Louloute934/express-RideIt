const express = require("express");
const formidable = require("express-formidable");
const isAuthenticated = require("../MiddleWares/isAuthendicated");
const router = express.Router();
router.use(formidable());

const User = require("../Model/User");
const Offer = require("../Model/Offer");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//PUBLISH OFFER =====================================+>>>>>>>>

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    const newOffer = new Offer({
      title: req.fields.title,
      description: req.fields.description,
      location: req.fields.location,
      price: req.fields.price,
      type: req.fields.type,
      miles: req.fields.miles,
      year: req.fields.year,
      model: req.fields.model,
      brand: req.fields.brand,
      owner: req.user,
    });
    if (req.files.picture) {
      const result = await cloudinary.uploader.upload(req.files.picture.path, {
        folder: `/RIDEIT/offer/${newOffer._id}`,
      });
      newOffer.picture = result;
    }
    if (req.files.secondPicture) {
      const result = await cloudinary.uploader.upload(
        req.files.secondPicture.path,
        {
          folder: `/RIDEIT/offer/${newOffer._id}`,
        }
      );
      newOffer.secondPicture = result;
    }
    if (req.files.thirdPicture) {
      const result = await cloudinary.uploader.upload(
        req.files.thirdPicture.path,
        {
          folder: `/RIDEIT/offer/${newOffer._id}`,
        }
      );
      newOffer.thirdPicture = result;
    }

    await newOffer.save();
    const user = await User.findById(req.user.id);
    user.offers.push({
      _id: newOffer.id,
      title: newOffer.title,
      price: newOffer.price,
      picture: newOffer.picture,
    });
    await user.save();
    res.json({
      _id: newOffer._id,
      title: newOffer.product_name,
      description: newOffer.description,
      location: newOffer.location,
      price: newOffer.price,
      type: newOffer.type,
      owner: newOffer.owner,
      picture: newOffer.picture,
      secondPicture: newOffer.secondPicture,
      thirdPicture: newOffer.thirdPicture,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//UPDATE OFFER============================================+++++>>>>>>>>>>><

router.post("/offer/update", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    for (i = 0; i < user.offers.length; i++) {
      if (user.offers[i]._id === req.fields.id) {
        await user.offers.splice(i, 1);
      }
    }

    await user.save();

    const offer = await Offer.findById(req.fields.id);

    offer.title = req.fields.title;
    offer.description = req.fields.description;
    offer.location = req.fields.location;
    offer.price = req.fields.price;
    offer.type = req.fields.type;
    offer.miles = req.fields.miles;
    offer.owner = req.user;
    offer.year = req.fields.year;
    offer.model = req.fields.model;
    offer.brand = req.fields.brand;

    if (req.files.picture) {
      const result = await cloudinary.uploader.upload(req.files.picture.path, {
        folder: `/RIDEIT/offer/${offer._id}`,
      });
      offer.picture = result;
    }
    if (req.files.secondPicture) {
      const result = await cloudinary.uploader.upload(
        req.files.secondPicture.path,
        {
          folder: `/RIDEIT/offer/${offer._id}`,
        }
      );
      offer.secondPicture = result;
    }
    if (req.files.thirdPicture) {
      const result = await cloudinary.uploader.upload(
        req.files.thirdPicture.path,
        {
          folder: `/RIDEIT/offer/${offer._id}`,
        }
      );
      offer.thirdPicture = result;
    }

    await offer.save();

    user.offers.push({
      _id: offer.id,
      title: offer.title,
      price: offer.price,
      picture: offer.picture,
    });
    await user.save();
    res.json({
      _id: offer.id,
      title: offer.product_name,
      description: offer.description,
      location: offer.location,
      price: offer.price,
      type: offer.type,
      owner: offer.owner,
      picture: offer.picture,
      secondPicture: offer.secondPicture,
      thirdPicture: offer.thirdPicture,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE OFFER +++++================================+>>>>>>>>>>>>>>>>>

router.post("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    for (i = 0; i < user.offers.length; i++) {
      if (user.offers[i]._id === req.fields.id) {
        await user.offers.splice(i, 1);
      }
    }
    res.json(user.offers);
    await user.save();
    const offer = await Offer.findByIdAndDelete(req.fields.id);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//GET OFFERS WITH FILTERS +++++++++++++++++=========================+>>>>>>

router.get("/offers", async (req, res) => {
  try {
    const filters = {};

    if (req.query.title) {
      filters.title = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMin) {
      filters.price = { $gte: req.query.priceMin };
    }

    if (req.query.priceMax) {
      if (filters.price) {
        filters.price.$lte = req.query.priceMax;
      } else {
        filters.price = { $lte: req.query.priceMax };
      }
    }
    if (req.query.type) {
      filters.type = req.query.type;
    }
    if (req.query.location) {
      filters.location = req.query.location;
    }

    let sort = {};
    if (req.query.sort) {
      if (req.query.sort === "price-asc") {
        sort = { price: 1 };
      } else if (req.query.sort === "price-desc") {
        sort = { price: -1 };
      }
    }

    let page;
    const limit = 20;

    if (req.query.page < 1) {
      page = 1;
    } else {
      page = Number(req.query.page);
    }

    const offers = await Offer.find(filters)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Offer.countDocuments(filters);

    res.status(200).json({
      count: count,
      offers: offers,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
    });
    res.json(offer);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
