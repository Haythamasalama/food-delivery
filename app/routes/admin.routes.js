const express = require("express");
const router = express.Router();
const { authJwt } = require("../middlewares");
const adminController = require("../controllers/admin.controller");

module.exports = router;
