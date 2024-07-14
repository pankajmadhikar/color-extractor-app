const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database connected= ", mongoose.connection.host);
  } catch (error) {
    console.log("Database connection error");
  }
};

module.exports = connectDb;
