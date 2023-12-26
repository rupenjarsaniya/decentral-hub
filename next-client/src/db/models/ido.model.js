const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const idoSchema = mongoose.Schema(
  {
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
    ido_address: { type: String, required: true, trim: true },
    token_total_supply: {
      type: Number,
      required: true,
    },
    token_per: {
      type: Number,
      required: true,
    },
    min_meme_tokens: {
      type: Number,
      required: true,
    },
    min_meme_token_to_participate: {
      type: Number,
      required: true,
    },
    ido_token: {
      type: String,
      required: true,
      trim: true,
    },
    meme_token: {
      type: String,
      required: true,
      trim: true,
    },
    start_time: {
      type: Date,
      required: true,
    },
    before_allocation_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      required: true,
    },
    claimable_time: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Not Started",
        "Started",
        "Before Allocation",
        "Ended",
        "Claimable",
        "Cancelled",
      ],
    },
    completion_percentage: {
      type: Number,
      required: true,
    },
    ido_tokens_left: {
      type: Number,
      required: true,
    },
    is_withdrawable: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Ido = mongoose.models["ido"] || mongoose.model("ido", idoSchema);

module.exports = Ido;
