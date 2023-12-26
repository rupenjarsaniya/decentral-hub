const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models["user"] || mongoose.model("user", userSchema);

module.exports = User;
