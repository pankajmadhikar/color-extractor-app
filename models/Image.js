const mongoose = require("mongoose");

const imageSchema = mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  colors: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model("ColorsImage", imageSchema);
