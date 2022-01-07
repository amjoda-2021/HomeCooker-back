const mongoose = require("mongoose");
const userProfileSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  isCook: { type: Boolean, required: true },
  userId: { type: String, required: true },
  city: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

module.exports = mongoose.model("UserProfile", userProfileSchema);
