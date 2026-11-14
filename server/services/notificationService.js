
const Agent = require("../models/Agent");
const Notification = require("../models/Notification");

const {
  calculateRelevance,
} = require("./relevanceService");

const routePostToAgents = async (post) => {
  // Get active agents except the publishing agent
  const agents = await Agent.find({
    status: "active",
    _id: { $ne: post.agent },
  });

  const notifications = [];

  for (const agent of agents) {
    const result = calculateRelevance(post, agent);

    if (result.isRelevant) {
      notifications.push({
        agent: agent._id,
        post: post._id,
        relevanceScore: result.score,
        matchedInterests: result.matchedInterests,
        status: "pending",
      });
    }
  }

  if (notifications.length > 0) {
    await Notification.insertMany(notifications, {
      ordered: false,
    });
  }

  return notifications;
};

module.exports = {
  routePostToAgents,
};
