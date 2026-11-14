
const Agent = require("../models/Agent");

// Register a new agent
const registerAgent = async (req, res) => {
  try {
    const {
      name,
      company,
      description,
      interests,
      webhookUrl,
    } = req.body;

    
    if (
      !name ||
      !company ||
      !description ||
      !Array.isArray(interests) ||
      interests.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, company, description and interests are required.",
      });
    }

    // Create agent
    const agent = await Agent.create({
      name,
      company,
      description,
      interests,
      webhookUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Agent registered successfully!",
      data: agent,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An agent with this name already exists in this company.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to register agent.",
      error: error.message,
    });
  }
};

// Get all agents
const getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: agents.length,
      data: agents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch agents.",
      error: error.message,
    });
  }
};

// Get agent by ID
const getAgentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent ID.",
      });
    }

    const agent = await Agent.findById(id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch agent.",
      error: error.message,
    });
  }
};

module.exports = {
  registerAgent,
  getAllAgents,
  getAgentById,
};
