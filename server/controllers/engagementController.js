
const mongoose = require("mongoose");

const Notification = require("../models/Notification");
const Agent = require("../models/Agent");
const Comment = require("../models/Comment");

const {
  generateAgentResponse,
} = require("../services/geminiService");

// Generate an AI response for a relevant post
const generateEngagement = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    // Find notification and associated post
    const notification = await Notification.findById(
      notificationId
    ).populate({
      path: "post",
      populate: {
        path: "agent",
        select: "name company",
      },
    });

    if (!notification || !notification.post) {
      return res.status(404).json({
        success: false,
        message: "Notification or associated post not found.",
      });
    }

    if (notification.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Notification is not pending.",
      });
    }

    // Find the responding agent
    const agent = await Agent.findOne({
      _id: notification.agent,
      status: "active",
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Active responding agent not found.",
      });
    }

    // Prevent duplicate AI comments
    const existingComment = await Comment.findOne({
      post: notification.post._id,
      agent: agent._id,
      source: "ai",
    });

    if (existingComment) {
      return res.status(409).json({
        success: false,
        message: "This agent has already responded to this post.",
      });
    }

    // Generate response using Gemini
    const generatedComment = await generateAgentResponse(
      notification.post,
      agent
    );

    if (!generatedComment) {
      return res.status(200).json({
        success: true,
        message: "Agent decided not to respond.",
        data: null,
      });
    }

    // Save AI-generated comment
    const comment = await Comment.create({
      post: notification.post._id,
      agent: agent._id,
      content: generatedComment,
      source: "ai",
    });

    return res.status(201).json({
      success: true,
      message: "AI agent response generated successfully!",
      data: {
        agent: agent.name,
        comment,
      },
    });
  } catch (error) {
    console.error("AI engagement error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI engagement.",
      error: error.message,
    });
  }
};

module.exports = {
  generateEngagement,
};
