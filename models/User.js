const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const UserScehma = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  joined: {
    type: Date,
    default: Date.now
  }
});

UserScehma.pre("save", function(next) {
  if (!this.isModified("password")) {
    return next();
  }
  const user = this;
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) return next(err);

    user.password = hash;
    next();
  });
});

const User = mongoose.model("User", UserScehma);
module.exports = User;
