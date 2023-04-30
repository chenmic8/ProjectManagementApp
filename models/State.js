const { Schema, model } = require("mongoose");

const stateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
      enum: ["text-danger", "text-warning", "text-success"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("State", stateSchema);
