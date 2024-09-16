const express = require("express");
const router = express.Router();

const {
  oauthLogin,
  callbackFunction,
} = require("../controllers/OauthController");

router.get("/login", oauthLogin);
router.post("/callback", callbackFunction);

module.exports = router;
