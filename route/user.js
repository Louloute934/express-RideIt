const express = require("express");
const formidable = require("express-formidable");
const router = express.Router();
router.use(formidable());

//Identification
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

//Models
const User = require("../Model/User");
const isAuthenticated = require("../MiddleWares/isAuthendicated");

//MiddleWares

//dotenv
require("dotenv").config();

//MailGun

const api_key = process.env.MAILGUN_API_KEY;
const domain = process.env.MAILGUN_DOMAIN;
const mailgun = require("mailgun-js")({ apiKey: api_key, domain: domain });

//CONTACT FORM+++++++======================================+>>>>

router.post("/user/contact", isAuthenticated, async (req, res) => {
  const { sender, senderEmail, senderText, beginDate, endDate } = req.fields;
  const data = {
    from: `${sender} <${senderEmail}>`,
    to: "lorris.mascarin@gmail.com" /* EMAIL AVEC LAQUELLE VOUS VOUS ÊTES ENREGISTRÉS SUR MAILGUN */,
    beginDate: beginDate,
    endDate: endDate,
    senderText: senderText,
  };
  mailgun.messages().send(data, (error, body) => {
    if (!error) {
      return res.json(body);
    }
    res.status(401).json(error);
  });
});

//USER SIGNUP==================+++++++++++++>>>>>>>>>>>>>>>>>

router.post("/user/signup", async (req, res) => {
  try {
    const salt = uid2(16);
    const token = uid2(64);
    const user = await User.findOne({ email: req.fields.email });
    if (!user) {
      if (req.fields.username && req.fields.email) {
        const newUser = new User({
          email: req.fields.email,
          username: req.fields.username,
          token: token,
          hash: SHA256(req.fields.password + salt).toString(encBase64),
          salt: salt,
        });
        await newUser.save();

        res.json({
          _id: newUser.id,
          token: newUser.token,
          username: newUser.username,
        });
      } else {
        res.json("All fields must be fill");
      }
    } else {
      res.status(400).json("Email already used with an existing account");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//USER LOGIN ++++=================+++++++++++++++++>>>>>>>>>>>>>>>>>>>>>>>>>

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });
    if (user) {
      const newHash = SHA256(req.fields.password + user.salt).toString(
        encBase64
      );
      if (user.hash === newHash) {
        res.json({
          id: user.id,
          token: user.token,

          username: user.username,
        });
      } else {
        res.status(400).json("Unauthorized");
      }
    } else {
      res.status(400).json("Unauthorized");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

// GET OFFERS FROM ONE USER ==========================>>>>>>

router.get("/user/offers", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
