
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    relevanceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    matchedInterests: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["pending", "delivered", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Avoid duplicate notifications for the same agent and post
notificationSchema.index(
  { agent: 1, post: 1 },
  { unique: true }
);

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

module.exports = Notification;
