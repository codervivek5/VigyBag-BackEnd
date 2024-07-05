const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const productRoutes = require("./productRoutes.js");

router.use("/auth", authRoutes);

module.exports = router;
