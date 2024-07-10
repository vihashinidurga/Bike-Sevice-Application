const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

//Register a new user
router.post("/register", async (req, res) => {
  try {
    const { email, mobileNumber, password, role, name, shopName } = req.body;

    //Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    //Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Create new user
    const newUser = new User({
      email,
      mobileNumber,
      password: hashedPassword,
      role,
      name,
      ...(role == "owner" && { shopName }),
    });

    await newUser.save();

    res
      .status(201)
      .json({ message: `${name} registered successfully as ${role}` });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, "USER", {
      expiresIn: "10d",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//Get current user profile

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
