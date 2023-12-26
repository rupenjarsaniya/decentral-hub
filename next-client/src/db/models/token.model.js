const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = mongoose.Schema(
  {
    token_address: {
      type: String,
      required: true,
      trim: true,
    },
    token_name: {
      type: String,
      required: true,
      trim: false,
    },
    token_symbol: {
      type: String,
      required: true,
      trim: true,
    },
    token_decimal: {
      type: Number,
      required: true,
    },
    token_initial_supply: {
      type: Number,
      required: true,
    },
    token_max_supply: {
      type: Number,
      required: true,
    },
    token_owner_address: {
      type: String,
      required: true,
      trim: true,
    },
    token_owner_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

const Token = mongoose.models["token"] || mongoose.model("token", tokenSchema);

module.exports = Token;
