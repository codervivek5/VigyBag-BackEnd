const express = require("express");
const { getProducts } = require("../controllers/productController");
const router = express.Router();

const authRoutes = require("./authRoutes");

router.use("/auth", authRoutes);
router.get("/products", getProducts);

module.exports = router;
