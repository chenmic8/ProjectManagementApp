const { Schema, model } = require("mongoose");

const imageSchema = new Schema(
  {
    imageSource: Buffer,
  },
  {
    timestamps: true,
  }
);

module.exports = model("Image", imageSchema);
