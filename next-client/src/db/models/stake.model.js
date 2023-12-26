const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stakeSchema = mongoose.Schema(
  {
    token_address: {
      type: String,
      required: true,
      trim: true,
    },
    stake_address: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Date,
      required: true,
    },
    interest_rate: {
      type: String,
      required: true,
    },
    total_stakers: {
      type: Number,
      default: 0,
    },
    staked_token: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      enum: ["Started", "Ended", "Paused"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    owner_address: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Stake = mongoose.models["Stake"] || mongoose.model("Stake", stakeSchema);

module.exports = Stake;
