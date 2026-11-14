
const express = require("express");

const router = express.Router();

const {
  createComment,
  getPostComments,
} = require("../controllers/commentController");

router.post("/", createComment);

router.get("/post/:postId", getPostComments);

module.exports = router;
