
const Agent = require("../models/Agent");
const Subscription = require("../models/Subscription");
const Notification = require("../models/Notification");

const { calculateRelevance } = require("./relevanceService");

const routePostToAgents = async (post) => {
  // Get all active agents except the agent who created the post.
  const agents = await Agent.find({
    status: "active",
    _id: { $ne: post.agent },
  }).lean();

  // Fetch active AND inactive subscriptions.
  const subscriptions = await Subscription.find().lean();

  const subscriptionMap = new Map(
    subscriptions.map((subscription) => [
      subscription.agent.toString(),
      subscription,
    ])
  );

  const operations = [];

  for (const agent of agents) {
    const subscription = subscriptionMap.get(
      agent._id.toString()
    );

    // Do not notify agents whose subscriptions are paused.
    if (subscription && !subscription.isActive) {
      continue;
    }

    // Use subscription preferences when available.
    // Otherwise, use the interests registered with the agent.
    const matchingAgent = {
      ...agent,
      interests: subscription
        ? [
            ...(subscription.topics || []),
            ...(subscription.categories || []),
          ]
        : agent.interests || [],
    };

    const result = calculateRelevance(post, matchingAgent);

    if (!result.isRelevant) {
      continue;
    }

    operations.push({
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

  if (operations.length > 0) {
    await Notification.bulkWrite(operations);
  }

  return operations.map((operation) => ({
    agentId: operation.updateOne.filter.agent,
    postId: operation.updateOne.filter.post,
  }));
};

module.exports = { routePostToAgents };
