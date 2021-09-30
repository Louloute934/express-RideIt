const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");

const app = express();
app.use(formidable());
app.use(cors());

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/RideIt", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

require("dotenv").config();

const userRoutes = require("./route/user");
app.use(userRoutes);
const offerRoutes = require("./route/offer");
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(400).json({ error: error.message });
});

app.listen(process.env.PORT, () => {
  console.log("Server has started");
});
