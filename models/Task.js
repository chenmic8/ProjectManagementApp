const { Schema, model } = require("mongoose");

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    state: { type: Schema.Types.ObjectId, ref: "State" },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: "644d97c6a5eedd5fc3be1ffb",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Task", taskSchema);
