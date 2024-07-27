const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Admin = require("../models/Admin.js");

dotenv.config();

exports.signup = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // Validate if all required fields are present
    if (!username || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    // Validate phone number format
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res
        .status(400)
        .json({ message: "Please enter a 10-digit phone number" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      phone,
    });

    res.status(201).json({ message: "User created successfully", newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (isMatch) {
        const adminRole = 1;
        const adminUsername = admin.username;

        await User.updateOne(
          { email },
          { $set: { role: adminRole, username: adminUsername } }
        );

        return res.status(200).json({
          message: "Admin access granted.",
          adminrole: adminRole,
          username: adminUsername,
        });
      } else {
        return res.status(401).json({ message: "Invalid admin password" });
      }
    }

    // Normal user login
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Send username along with success message
    res.status(200).json({
      message: "Login successful",
      username: user.username,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.otp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email is registered
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not registered" });
    }

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to user's document or in-memory store
    user.otp = otp;
    user.otpExpires = Date.now() + 3600000; // OTP expires in 1 hour
    await user.save();

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Your OTP Code for VIGYBAG",
      html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="X-UA-Compatible" content="ie=edge" />
          <title>VigyBag</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
        </head>
        <body style="margin: 0; font-family: 'Poppins', sans-serif; background: #ffffff; font-size: 14px;">
          <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff; background-image: url('https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner'); background-repeat: no-repeat; background-size: 800px 452px; background-position: top center; font-size: 14px; color: #434343;">
            <header>
              <table style="width: 100%;">
                <tbody>
                  <tr style="height: 0;">
                    <td>
                      <img alt="VigyBag" src="https://www.vigybag.com/assets/Logo-HJo2K1MQ.svg" height="30px" />
                    </td>
                    <td style="text-align: right;">
                      <span style="font-size: 16px; line-height: 30px; color: #ffffff;">${new Date().toLocaleDateString()}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </header>

            <main>
              <div style="margin: 0; margin-top: 70px; padding: 92px 30px 115px; background: #ffffff; border-radius: 30px; text-align: center;">
                <div style="width: 100%; max-width: 489px; margin: 0 auto;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 500; color: #1f1f1f;">
                    Your OTP
                  </h1>
                  <p style="margin: 0; margin-top: 17px; font-size: 16px; font-weight: 500;">
                    Hello ${user.username || "Customer"},
                  </p>
                  <p style="margin: 0; margin-top: 17px; font-weight: 500; letter-spacing: 0.56px;">
                    Thank you for choosing VigyBag. Use the following OTP to complete your verification process. The OTP is valid for <span style="font-weight: 600; color: #1f1f1f;">1 hour</span>. Do not share this code with anyone.
                  </p>
                  <p style="margin: 0; margin-top: 60px; font-size: 40px; font-weight: 600; letter-spacing: 25px; color: #ba3d4f;">
                    ${otp}
                  </p>
                </div>
              </div>

              <p style="max-width: 400px; margin: 0 auto; margin-top: 90px; text-align: center; font-weight: 500; color: #8c8c8c;">
                Need help? Ask at
                <a href="mailto:vigybag@gmail.com" style="color: #499fb6; text-decoration: none;">vigybag@gmail.com</a>
                or visit our
                <a href="https://vigybag.com/help" target="_blank" style="color: #499fb6; text-decoration: none;">Help Center</a>
              </p>
            </main>

            <footer style="width: 100%; max-width: 490px; margin: 20px auto 0; text-align: center; border-top: 1px solid #e6ebf1;">
              <p style="margin: 0; margin-top: 40px; font-size: 16px; font-weight: 600; color: #434343;">
                VigyBag
              </p>
              <p style="margin: 0; margin-top: 8px; color: #434343;">
                Address 540, City, State.
              </p>
              <div style="margin: 0; margin-top: 16px;">
                <a href="https://facebook.com/vigybag" target="_blank" style="display: inline-block;">
                  <img width="36px" alt="Facebook" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661502815169_682499/email-template-icon-facebook" />
                </a>
                <a href="https://instagram.com/vigybag" target="_blank" style="display: inline-block; margin-left: 8px;">
                  <img width="36px" alt="Instagram" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661504218208_684135/email-template-icon-instagram" />
                </a>
                <a href="https://twitter.com/vigybag" target="_blank" style="display: inline-block; margin-left: 8px;">
                  <img width="36px" alt="Twitter" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503043040_372004/email-template-icon-twitter" />
                </a>
                <a href="https://youtube.com/vigybag" target="_blank" style="display: inline-block; margin-left: 8px;">
                  <img width="36px" alt="Youtube" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503195931_210869/email-template-icon-youtube" />
                </a>
              </div>
              <p style="margin: 0; margin-top: 16px; color: #434343;">
                Copyright © ${new Date().getFullYear()} VigyBag. All rights reserved.
              </p>
            </footer>
          </div>
        </body>
      </html>
    `,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ message: "OTP sent successfully" });
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
