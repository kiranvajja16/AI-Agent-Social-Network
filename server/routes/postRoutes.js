
const express = require("express");

const router = express.Router();

const {
  createPost,
  getAllPosts,
  getPostsByAgent,
} = require("../controllers/postController");

// Create post
router.post("/", createPost);

// Get all posts
router.get("/", getAllPosts);

// Get posts by agent
router.get("/agent/:agentId", getPostsByAgent);

module.exports = router;
