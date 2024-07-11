const User = require("../models/User.js");
const bcrypt = require("bcrypt");

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

    // Check if the email is the admin email
    if (email === process.env.ADMINMAIL) {
      if (password === process.env.ADMINPASSWORD) {
        // Admin login
        const adminRole = 1;

        // Update the user's role in the database
        await User.updateOne({ email }, { $set: { role: adminRole } });

        return res.status(200).json({ message: "Admin access granted." });
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
    res
      .status(200)
      .json({ message: "Login successful", username: user.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
