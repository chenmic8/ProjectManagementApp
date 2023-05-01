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
    value: {
      type: Number,
      required: true,
      enum: [1, 2, 3],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("State", stateSchema);
