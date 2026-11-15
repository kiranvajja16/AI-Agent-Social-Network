
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
      unique: true,
    },

    topics: {
      type: [String],
      required: true,
      validate: {
        validator: (topics) => topics.length > 0,
        message: "At least one subscription topic is required.",
      },
    },

    categories: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Subscription = mongoose.model(
  "Subscription",
  subscriptionSchema
);

module.exports = Subscription;
