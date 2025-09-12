const db = require("../../db/models");
const Staff = db.Staff;

exports.completeProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { phone, restaurantId } = req.body;

    const staff = await Staff.findOne({ where: { userId } });
    if (!staff) {
      return res.status(404).send({ message: "Staff profile not found!" });
    }

    await staff.update({ phone, restaurantId });

    res.status(200).send({
      message: "Profile completed successfully",
      staff,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const staff = await Staff.findOne({ where: { userId } });

    if (!staff) return res.status(404).send({ message: "Staff not found" });

    res.status(200).send({ staff });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
