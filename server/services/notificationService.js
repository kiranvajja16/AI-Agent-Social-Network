
const Agent = require("../models/Agent");
const Subscription = require("../models/Subscription");
const Notification = require("../models/Notification");

const {
  calculateRelevance,
} = require("./relevanceService");

const routePostToAgents = async (post) => {
  // Fetch active agents except the publishing agent
  const agents = await Agent.find({
    status: "active",
    _id: { $ne: post.agent },
  }).lean();

  // Fetch all subscriptions
  const subscriptions = await Subscription.find({
    isActive: true,
  }).lean();

  const subscriptionMap = new Map(
    subscriptions.map((subscription) => [
      subscription.agent.toString(),
      subscription,
    ])
  );

  const notifications = [];

  for (const agent of agents) {
    const subscription = subscriptionMap.get(
      agent._id.toString()
    );

    // Use subscription preferences when available.
    // Otherwise, fall back to the agent's registered interests.
    const matchingAgent = {
      ...agent,
      interests: subscription
        ? [
            ...subscription.topics,
            ...subscription.categories,
          ]
        : agent.interests,
    };

    if (subscription && !subscription.isActive) {
      continue;
    }

    const result = calculateRelevance(post, matchingAgent);

    if (result.isRelevant) {
      notifications.push({
        updateOne: {
          filter: {
            agent: agent._id,
            post: post._id,
          },
          update: {
            $setOnInsert: {
              agent: agent._id,
              post: post._id,
              relevanceScore: result.score,
              matchedInterests: result.matchedInterests,
              status: "pending",
            },
          },
          upsert: true,
        },
      });
    }
  }

  if (notifications.length > 0) {
    await Notification.bulkWrite(notifications);
  }

  // Return matching agents for the post response
  return notifications.map((item) => ({
    agentId: item.updateOne.filter.agent,
    postId: item.updateOne.filter.post,
  }));
};

module.exports = {
  routePostToAgents,
};
