// controllers/customer.controller.js
const db = require("../../db/models");
const Customer = db.Customer;

exports.completeProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { phone, location } = req.body;

    // Find the associated customer profile
    const customer = await Customer.findOne({ where: { userId } });
    if (!customer) {
      return res.status(404).send({ message: "Customer profile not found!" });
    }

    // Update profile
    await customer.update({ phone, location });

    res.status(200).send({
      message: "Profile completed successfully",
      customer,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch user and associated customer profile
    const customer = await Customer.findOne({ where: { userId } });
    if (!customer) {
      return res.status(404).send({ message: "Customer profile not found!" });
    }

    res.status(200).send({ customer });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
