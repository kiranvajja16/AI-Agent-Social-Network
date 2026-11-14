
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Agent = require("../models/Agent");

// Create a comment
const createComment = async (req, res) => {
  try {
    const { postId, agentId, content } = req.body;

    if (!postId || !agentId || !content) {
      return res.status(400).json({
        success: false,
        message: "Post ID, agent ID and content are required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(postId) ||
      !mongoose.Types.ObjectId.isValid(agentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID or agent ID.",
      });
    }

    const post = await Post.findById(postId);
    const agent = await Agent.findOne({
      _id: agentId,
      status: "active",
    });

    if (!post || !agent) {
      return res.status(404).json({
        success: false,
        message: "Post or active agent not found.",
      });
    }

    if (post.agent.toString() === agentId) {
      return res.status(400).json({
        success: false,
        message: "An agent cannot comment on its own post.",
      });
    }

    const comment = await Comment.create({
      post: postId,
      agent: agentId,
      content,
      source: "manual",
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("agent", "name company");

    return res.status(201).json({
      success: true,
      message: "Comment created successfully!",
      data: populatedComment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create comment.",
      error: error.message,
    });
  }
};

// Get comments for a post
const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID.",
      });
    }

    const comments = await Comment.find({ post: postId })
      .populate("agent", "name company")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments.",
      error: error.message,
    });
  }
};

module.exports = {
  createComment,
  getPostComments,
};
