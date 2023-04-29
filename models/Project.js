const { Schema, model } = require("mongoose");

const projectSchema = new Schema(
  {
    title: String,
    order: Number,
    dateCreated: Date,
    description: String,
  },
  {
    timestamps: true,
  }
);

module.exports = model("Project", projectSchema);
