// bin/seeds.js

const mongoose = require("mongoose");
const State = require("./models/State");
require("dotenv").config();

const MONGO_URI = process.env.MONGODB_URI;

const states = [
  {
    name: "new",
    color: "text-success",
  },
  {
    name: "ongoing",
    color: "text-warning",
  },
  {
    name: "complete",
    color: "text-danger",
  },
];

mongoose
  .connect(MONGO_URI)
  .then((x) => {
    console.log(`Connected to Mongo database: "${x.connections[0].name}"`);

    // Create new documents in the books collection
    return State.create(states);
  })
  .then((statesFromDB) => {
    console.log(`Created ${statesFromDB.length} states`);

    // Once the documents are created, close the DB connection
    return mongoose.connection.close();
  })
  .then(() => {
    // Once the DB connection is closed, print a message
    console.log("DB connection closed!");
  })
  .catch((err) => {
    console.log(`An error occurred while creating books from the DB: ${err}`);
  });
