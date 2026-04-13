const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const User = require("./models/User");
require("dotenv").config();

const app = express();
const otpStore = {};

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= DB CONNECT =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("API running");
});

// ================= SIGNUP =================
app.post("/signup", async (req, res) => {
  try {
    const { fullName, email, phoneNumber, accountType, password } = req.body;

    if (!fullName || !email || !phoneNumber || !accountType || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }]
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      email,
      phoneNumber,
      accountType,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ success: true, message: "Signup successful" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= LOGIN (OTP SEND) =================
app.post("/login", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number required" });
    }

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[phoneNumber] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    console.log("🔥 OTP:", otp);

    res.json({ success: true, message: "OTP sent" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= VERIFY OTP + JWT =================
app.post("/verify-otp", async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    const record = otpStore[phoneNumber];

    if (!record) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (Date.now() > record.expires) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp != otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    delete otpStore[phoneNumber];

    const user = await User.findOne({ phoneNumber });

    // 🔥 JWT TOKEN (ENV use kar)
    const token = jwt.sign(
      { id: user._id, phoneNumber: user.phoneNumber },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        accountType: user.accountType
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= SERVER START =================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});