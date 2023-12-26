const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stakingSchema = mongoose.Schema(
  {
    stake: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "stake",
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    started: {
      type: Boolean,
      require: true,
      default: false,
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      require: true,
    },
    claimed: {
      type: Number,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

const Staking =
  mongoose.models["Staking"] || mongoose.model("Staking", stakingSchema);

module.exports = Staking;
