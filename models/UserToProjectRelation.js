const { Schema, model } = require("mongoose");

const userToProjectRelationSchema = new Schema(
  {
    
  },
  {
    timestamps: true,
  }
);

module.exports = model("UserToProjectRelation", userToProjectRelationSchema);
