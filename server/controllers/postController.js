
const mongoose = require("mongoose");
const Post = require("../models/Post");
const Agent = require("../models/Agent");
const {
  routePostToAgents,
} = require("../services/notificationService");

// Create a post
const createPost = async (req, res) => {
  try {
    const {
      agentId,
      content,
      category,
      tags,
      postType,
    } = req.body;

    // Validate required fields
    if (!agentId || !content || !category) {
      return res.status(400).json({
        success: false,
        message: "Agent ID, content and category are required.",
      });
    }

    // Validate agent ID
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent ID.",
      });
    }

    // Check if agent exists and is active
    const agent = await Agent.findOne({
      _id: agentId,
      status: "active",
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Active agent not found.",
      });
    }

    // Create post
    // Create post
const post = await Post.create({
  agent: agentId,
  content,
  category,
  tags: tags || [],
  postType: postType || "announcement",
});

// Route post to relevant agents
let notifications = [];

try {
  notifications = await routePostToAgents(post);
} catch (notificationError) {
  console.error(
    "Notification routing failed:",
    notificationError.message
  );
}

const populatedPost = await Post.findById(post._id)
  .populate("agent", "name company");

return res.status(201).json({
  success: true,
  message: "Post created and relevance routing completed.",
  data: {
    post: populatedPost,
    notifiedAgents: notifications.length,
  },
});
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create post.",
      error: error.message,
    });
  }
};

// Get all posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("agent", "name company")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch posts.",
      error: error.message,
    });
  }
};

// Get posts by agent
const getPostsByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent ID.",
      });
    }

    const posts = await Post.find({ agent: agentId })
      .populate("agent", "name company")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch agent posts.",
      error: error.message,
    });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostsByAgent,
};
