const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  title: String,
  description: String,
  price: Number,
  location: String,
  miles: Number,
  year: Number,
  type: String,
  model: String,
  brand: String,
  picture: { type: mongoose.Schema.Types.Mixed, default: {} },
  secondPicture: { type: mongoose.Schema.Types.Mixed, default: {} },
  thirdPicture: { type: mongoose.Schema.Types.Mixed, default: {} },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Offer;
