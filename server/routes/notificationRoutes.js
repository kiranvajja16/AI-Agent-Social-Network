
const express = require("express");

const router = express.Router();

const {
  getAgentNotifications,
} = require("../controllers/notificationController");

router.get("/agent/:agentId", getAgentNotifications);

module.exports = router;
