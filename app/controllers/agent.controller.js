const db = require("../../db/models");
const Agent = db.Agent;

exports.completeProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { phone, restaurantId } = req.body;

    const agent = await Agent.findOne({ where: { userId } });
    if (!agent) {
      return res.status(404).send({ message: "Agent profile not found!" });
    }

    await agent.update({ phone, restaurantId });

    res.status(200).send({
      message: "Profile completed successfully",
      agent,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const agent = await Agent.findOne({ where: { userId } });

    if (!agent) return res.status(404).send({ message: "Agent not found" });

    res.status(200).send({ agent });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
