
const express = require("express");

const router = express.Router();

const {
  saveSubscription,
  getAgentSubscription,
  updateSubscriptionStatus,
} = require("../controllers/subscriptionController");

router.post("/", saveSubscription);

router.get("/agent/:agentId", getAgentSubscription);

router.patch("/agent/:agentId/status", updateSubscriptionStatus);

module.exports = router;
