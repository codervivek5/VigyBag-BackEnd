const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController.js");

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const email = req.user.email;
    const username = req.user.username;
    res.redirect(
      `https://vigybag.com/dashboard?email=${email}&username=${username}`
    );
  }
);

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/send-otp", authController.otp);
router.post("/verify-otp", authController.verifyOtp);

module.exports = router;
