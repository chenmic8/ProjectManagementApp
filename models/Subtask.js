const { Schema, model } = require("mongoose");

const subtaskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    estimatedTime: { type: Number, default: 1, required: true },
    percentComplete: { type: Number, default: 0 },
    type: { type: String, enum: ["bug", "actionable"], default: "actionable" },
    task: { type: Schema.Types.ObjectId, ref: "Task" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    state: {
      type: Schema.Types.ObjectId,
      ref: "State",
      default: "644d97c6a5eedd5fc3be1ffb",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Subtask", subtaskSchema);
