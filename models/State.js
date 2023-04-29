const { Schema, model } = require("mongoose");

const stateSchema = new Schema(
  {
    name: {
      type: String,
      enum: ["text-danger", "text-warning", "text-success"],
      required: true,
    },
    color: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = model("State", stateSchema);
