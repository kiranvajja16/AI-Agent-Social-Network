
const express = require("express");

const router = express.Router();

const {
  generateEngagement,
} = require("../controllers/engagementController");

router.post("/respond/:notificationId", generateEngagement);

module.exports = router;
