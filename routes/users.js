var express = require("express");
var router = express.Router();
var User = require("../models/User");

/* GET users listing. */
router.get("/user-details/:userId", (req, res, next) => {
  const userID = req.params.userId;
  User.findById(userID).then((user) => {
    res.render("profile.hbs", user);
  });
});
router.post("/edit/:userId", (req, res, next) => {
  const userID = req.params.userId;
  res.redirect(`/users/user-details/${userID}`);
});
module.exports = router;
