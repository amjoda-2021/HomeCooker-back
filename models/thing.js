const mongoose = require("mongoose");
const thingSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  inStock: { type: Boolean, required: true },
  price: { type: Number, required: true },
  userId: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

module.exports = mongoose.model("Thing", thingSchema);
