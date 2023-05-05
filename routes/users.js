var express = require("express");
var router = express.Router();
var User = require("../models/User");
var Subtask = require("../models/Subtask");
var bcryptjs = require("bcryptjs");
const { isLoggedIn } = require("../middleware/route-guard");
const saltRounds = 10;

/* GET users listing. */
router.get("/user-details", isLoggedIn, (req, res) => {
  const userID = req.session.user._id;
  User.findById(userID).then((user) => {
    Subtask.find({ user: userID }, "estimatedTime percentComplete").then(
      (subtasks) => {
        let deepcopyUser = JSON.parse(JSON.stringify(user));
        function getTotalTimeRemaining(subtasks) {
          return subtasks.reduce(
            (a, b) =>
              a +
              Math.round(10 * b.estimatedTime * (1 - b.percentComplete / 100)) /
                10,
            0
          );
        }
        function getTotalEstimatedTime(subtasks) {
          return subtasks.reduce((a, b) => a + b.estimatedTime, 0);
        }
        function getPercentComplete(totalEstimatedTime, totalTimeRemaining) {
          return Math.round(
            ((totalEstimatedTime - totalTimeRemaining) / totalEstimatedTime) *
              100
          );
        }
        deepcopyUser.totalTimeRemaining = getTotalTimeRemaining(subtasks);
        deepcopyUser.totalEstimatedTime = getTotalEstimatedTime(subtasks);
        deepcopyUser.percentComplete = getPercentComplete(
          deepcopyUser.totalEstimatedTime,
          deepcopyUser.totalTimeRemaining
        );
        deepcopyUser.totalTimeCompleted =
          deepcopyUser.totalEstimatedTime - deepcopyUser.totalTimeRemaining;
        user = deepcopyUser;

        res.render("profile.hbs", user);
      }
    );
  });
});
router.get("/edit", isLoggedIn, (req, res) => {
  const userID = req.session.user._id;

  User.findById(userID).then((user) => {
    res.render("editProfile.hbs", user);
  });
});
router.post("/edit", (req, res, next) => {
  const userID = req.session.user._id;
  const { firstName, lastName, username, email, password, profilePicture } =
    req.body;
  //check if password matches
  User.findOne({ email })
    .then((user) => {
      user.errorMessage = "password is incorrect";
      if (!user) {
        res.render("editProfile.hbs", user);
        return;
        //validate password
      } else if (bcryptjs.compareSync(password, user.password)) {
        User.findOneAndUpdate(
          { email: email },
          { firstName, lastName, username, email }
        ).then(() => {
          res.redirect(`/users/user-details`);
        });
      } else {
        res.render("editProfile.hbs", user);
      }
    })
    .catch((error) => console.log(error));
  // res.redirect(`/users/user-details`);
});
router.post("/change-password", (req, res) => {
  const userID = req.session.user._id;
  const { newPassword, newPasswordRepeat, currentPassword } = req.body;
  User.findById(userID)
    .then((user) => {
      if (!user) {
        user.errorMessage = "passwords don't match or password is incorrect";
        res.render("editProfile.hbs", user);
        return;
        //validate password
      } else if (
        bcryptjs.compareSync(currentPassword, user.password) &&
        newPassword === newPasswordRepeat
      ) {
        bcryptjs
          .genSalt(saltRounds)
          .then((salt) => bcryptjs.hash(password, salt))
          .then((hashedPassword) => {
            return User.findByIdAndUpdate({
              password: hashedPassword,
            });
          })
          .then((updatedUser) => {
            console.log("Newly updated user is: ", updatedUser);
            res.redirect("/users/user-details");
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        user.errorMessage = "passwords don't match or password is incorrect";
        res.render("editProfile.hbs", user);
      }
    })
    .catch((error) => console.log(error));
});

router.post("/delete", (req, res) => {
  const userID = req.session.user._id;
  User.findByIdAndDelete(userID).then(() => {
    req.session.destroy((err) => {
      if (err) next(err);
      res.redirect("/");
    });
  });
});

module.exports = router;
