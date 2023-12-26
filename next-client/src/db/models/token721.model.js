const mongoose = require("mongoose");

const token721Schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    uri: {
      type: String,
      required: true,
      trim: true,
    },
    token_id: {
      type: Number,
      required: true,
    },
    nft_owner_address: {
      type: String,
      required: true,
      trim: true,
    },
    nft_owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

const Token721 =
  mongoose.models["Token721"] || mongoose.model("Token721", token721Schema);

module.exports = Token721;
