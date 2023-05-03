const { Schema, model } = require("mongoose");

const projectSchema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    description: String,
    user: { type: Schema.Types.ObjectId, ref: "User" },
    state: {
      type: Schema.Types.ObjectId,
      ref: "State",
      default: "644d97c6a5eedd5fc3be1ffb",
    },
    github: {
      username: String,
      repo: String,
      url: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Project", projectSchema);
