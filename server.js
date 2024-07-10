const express = require("express");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");

const path = require("path");
app.use(express.json());
app.use(bodyParser.json());
const authRoutes = require("./routes/authenticationRoute");
const servicesRoutes = require("./routes/serviceRoute");
const bookingRoutes = require("./routes/bookingRoute");

app.use("/api/auth", authRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/bookings", bookingRoutes);

if (process.env.NODE_ENV === "production") {
  app.use("/", express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.get("/", (req, res) => {
  res.send("Welcome to the Bike Service Station API");
});

mongoose
  .connect(process.env.MONGO_URL, {})
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
  });

const port = process.env.PORT || 5000;

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Node Express Server Started at ${port}!`));
