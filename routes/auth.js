var express = require("express");
var router = express.Router();
const bcryptjs = require("bcryptjs");
const saltRounds = 10;

const User = require("../models/User");

router.get("/signup", (req, res) => {
  res.render("auth/signup");
});
router.post("/signup", (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  //can add here: check if password meets all requirements (regex)

  bcryptjs
    .genSalt(saltRounds)
    .then((salt) => bcryptjs.hash(password, salt))
    .then((hashedPassword) => {
      return User.create({
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
      });
    })
    .then((createdUser) => {
      res.redirect("/");
    })
    .catch((error) => {
      console.error(error);
    });
});
router.get("/login", (req, res, next) => {
  res.render("auth/login.hbs");
});

router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        res.render("auth/login", {
          errorMessage: "Email or password is incorrect.",
        });
        return;
        //validate password
      } else if (bcryptjs.compareSync(password, user.password)) {
        req.session.user = user;
        res.redirect(`/`);
      } else {
        res.render("auth/login", {
          errorMessage: "Email or password is incorrect.",
        });
      }
    })
    .catch((error) => next(error));
});

router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) next(err);
    res.redirect("/");
  });
});

module.exports = router;