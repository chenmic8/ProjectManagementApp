var express = require("express");
var router = express.Router();
const Image = require("../models/Image");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", upload.single("profilePicture"), (req, res) => {
  //   if (req.body.profilePicture) {
  // let image = JSON.parse(req.body.profilePicture);
  // let imageType = image.type;
  // image = new Buffer.from(image.data, "base64");
  // Image.create({
  //   image,
  //   imageType,
  // }).then(() => {
  const encoded = req.file.buffer.toString("base64");
  const imageType = req.file.mimetype;
  const imageSource = `data:${imageType};charset=utf-8;base64, ${encoded}`;
  Image.create({ imageSource });
  res.redirect("/images");
  // });
  //   }
});
router.get("/", (req, res) => {
  //   Image.findOne().then((image) => {
  //     if (image) {
  //       console.log(image);
  //       const imageSource = `data:${
  //         image.imageType
  //       };charset=utf-8;base64, ${image.image.toString("base64")}`;
  //       res.render("images", { imageSource });
  //     }
  Image.findOne().then((image) => {
    // if (image) {
    //   console.log(image);
    //   const imageSource = `data:${
    //     image.imageType
    //   };charset=utf-8;base64, ${image.image.toString("base64")}`;
    res.render("images", { image: image.imageSource });
    // }
    //   res.render("images");
  });
});

module.exports = router;
