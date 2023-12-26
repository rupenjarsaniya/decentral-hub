const mongoose = require("mongoose");

const memeTokenSchema = mongoose.Schema(
  {
    meme_token_address: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    symbol: {
      type: String,
      required: true,
      trim: true,
    },
    decimal: {
      type: Number,
      required: true,
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
    },
    total_supply: {
      type: Number,
      required: true,
      trim: true,
    },
    available_tokens: {
      type: Number,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const MemeToken =
  mongoose.models["Memetoken"] || mongoose.model("Memetoken", memeTokenSchema);

module.exports = MemeToken;
