const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1/db");

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("db is connected...");
});
