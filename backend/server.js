const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// test route
app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

app.post("/signup", async (req, res) => {
  try {
    const { fullName, email, phoneNumber, accountType, password } = req.body;

    // 🔴 1. Check empty fields
    if (!fullName || !email || !phoneNumber || !accountType || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔴 2. Email format check
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // 🔴 3. Phone validation
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // 🔴 4. Password strength
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // 🔴 5. Duplicate check
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }]
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔐 6. Password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 7. Save user
    const user = new User({
      fullName,
      email,
      phoneNumber,
      accountType,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({success:true, message: "Signup successful" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
  console.log("Signup route hit",req.body);
});

app.post("/login", async (req, res) => {
  const { phoneNumber } = req.body;

  // basic validation
  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number required" });
  }

  // check user exists
  const user = await User.findOne({ phoneNumber });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // (OTP system baad me banayenge)
  res.json({
    success: true,
    message: "OTP sent (mock)",
    user
  });
});