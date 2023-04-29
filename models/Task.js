const { Schema, model } = require("mongoose");

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    order: Number,
    dateCreated: {
      type: Date,
      default: Date.now,
    },
    description: String,
    estimatedTime: { type: Number, required: true },
    percentComplete: { type: Number, default: 0 },
    stateID: {
      type: Schema.Types.ObjectId,
      //default: objectID() for "new state"
      required: true,
    },
    projectID: {
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Task", taskSchema);
