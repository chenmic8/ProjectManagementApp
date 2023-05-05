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
      console.log("Newly created user is: ", createdUser);
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
    // res.locals.session = "notLoggedIn";
    res.redirect("/");
  });
});

module.exports = router;

//password validation - can go in frontend
// function validatePassword(p) {
//     const errors = [];
//     if (p.length < 8) {
//         errors.push("Your password must be at least 8 characters");
//     }
//     if (p.length > 32) {
//         errors.push("Your password must be at max 32 characters");
//     }
//     if (p.search(/[a-z]/) < 0) {
//         errors.push("Your password must contain at least one lower case letter.");
//     }
//     if (p.search(/[A-Z]/) < 0) {
//         errors.push("Your password must contain at least one upper case letter.");
//     }
//     if (p.search(/[0-9]/) < 0) {
//         errors.push("Your password must contain at least one digit.");
//     }
//    if (p.search(/[!@#\$%\^&\*_]/) < 0) {
//         errors.push("Your password must contain at least special char from -[ ! @ # $ % ^ & * _ ]");
//     }
//     if (errors.length > 0) {
//         console.log(errors.join("\n"));
//         return false;
//     }
//     return true;
// }
