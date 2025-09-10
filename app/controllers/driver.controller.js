const db = require("../../db/models");
const Driver = db.Driver;

exports.completeProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { phone, vehicleType } = req.body;

    // Find the associated driver profile
    const driver = await Driver.findOne({ where: { userId } });
    if (!driver) {
      return res.status(404).send({ message: "Driver profile not found!" });
    }

    // Update profile
    await driver.update({ phone, vehicleType });

    res.status(200).send({
      message: "Profile completed successfully",
      driver,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const driver = await Driver.findOne({ where: { userId } });

    if (!driver) return res.status(404).send({ message: "Driver not found" });

    res.status(200).send({ driver });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.updateDriverStatus = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status } = req.body;

    const driver = await Driver.findByPk(driverId);
    if (!driver) return res.status(404).send({ message: "Driver not found" });

    await driver.update({ status });
    res.status(200).send({ message: "Status updated", driver });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.findAll();
    res.status(200).send({ drivers });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
