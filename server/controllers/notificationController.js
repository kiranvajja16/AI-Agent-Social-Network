
const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// Get notifications for an agent
const getAgentNotifications = async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent ID.",
      });
    }

    const notifications = await Notification.find({
      agent: agentId,
    })
      .populate({
        path: "post",
        populate: {
          path: "agent",
          select: "name company",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
      error: error.message,
    });
  }
};

module.exports = {
  getAgentNotifications,
};
