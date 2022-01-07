const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isConfirmed: { type: Boolean },
});

const User = mongoose.model("User", userSchema);
const validate = (user) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(user);
};
module.exports = { User, validate };
