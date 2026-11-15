
const mongoose = require("mongoose");
const Agent = require("../models/Agent");
const Subscription = require("../models/Subscription");

// Create or update an agent subscription
const saveSubscription = async (req, res) => {
  try {
    const { agentId, topics, categories } = req.body;

    if (!agentId || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Agent ID and at least one topic are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent ID.",
      });
    }

    if (
      topics.some(
        (topic) => typeof topic !== "string" || !topic.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Topics must contain valid text values.",
      });
    }

    if (
      categories !== undefined &&
      (!Array.isArray(categories) ||
        categories.some(
          (category) =>
            typeof category !== "string" || !category.trim()
        ))
    ) {
      return res.status(400).json({
        success: false,
        message: "Categories must be an array of valid text values.",
      });
    }

    const agent = await Agent.findById(agentId);

    if (!agent || agent.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Active agent not found.",
      });
    }

    const subscription = await Subscription.findOneAndUpdate(
      { agent: agentId },
      {
        $set: {
          topics: [...new Set(topics.map((topic) => topic.trim().toLowerCase()))],
          categories: [
            ...new Set(
              (categories || []).map((category) =>
                category.trim().toLowerCase()
              )
            ),
          ],
          isActive: true,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).populate("agent", "name company");

    return res.status(200).json({
      success: true,
      message: "Subscription saved successfully.",
      data: subscription,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to save subscription.",
      error: error.message,
    });
  }
};

// Get subscription for an agent
const getAgentSubscription = async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent ID.",
      });
    }

    const subscription = await Subscription.findOne({
      agent: agentId,
    }).populate("agent", "name company");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription.",
      error: error.message,
    });
  }
};

// Pause or resume subscription
const updateSubscriptionStatus = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent ID.",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    const subscription = await Subscription.findOneAndUpdate(
      { agent: agentId },
      { $set: { isActive } },
      { new: true, runValidators: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Subscription resumed."
        : "Subscription paused.",
      data: subscription,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update subscription.",
      error: error.message,
    });
  }
};

module.exports = {
  saveSubscription,
  getAgentSubscription,
  updateSubscriptionStatus,
};
