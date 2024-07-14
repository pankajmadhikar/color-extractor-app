const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const imageRoutes = require("./routes/imageRoutes");
const dotenv = require("dotenv");
const connectDb = require("./config/db");

const app = express();
dotenv.config();
app.use(cors());
app.use(bodyParser.json());
app.use("./uploads", express.static("uploads"));
app.use("/api/images", imageRoutes);

connectDb();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Backend run on http://localhost:${PORT}`);
});
