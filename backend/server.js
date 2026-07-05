const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const { Op } = require("sequelize");
const sequelize = require("./config/database");
const User = require("./models/User");
const Job = require("./models/Job");
const Transaction = require("./models/Transaction");
require("dotenv").config();

// ================= RELATIONSHIPS =================
User.hasMany(Job, { foreignKey: 'workerId', as: 'workerJobs' });
Job.belongsTo(User, { foreignKey: 'workerId', as: 'worker' });

User.hasMany(Job, { foreignKey: 'customerId', as: 'customerJobs' });
Job.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

User.hasMany(Transaction, { foreignKey: 'workerId' });
Transaction.belongsTo(User, { foreignKey: 'workerId' });

const app = express();
const otpStore = {};

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= DB CONNECT =================
sequelize.sync()
  .then(() => console.log("PostgreSQL Connected and synced"))
  .catch(err => console.log("DB Connection Error:", err));

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("API running with PostgreSQL");
});

// ================= SIGNUP =================
app.post("/signup", async (req, res) => {
  try {
    const { fullName, email, phoneNumber, accountType, password } = req.body;

    if (!fullName || !email || !phoneNumber || !accountType || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phoneNumber }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      accountType,
      password: hashedPassword
    });

    res.status(201).json({ success: true, message: "Signup successful" });

  } catch (err) {
    console.error("Signup error:", err);
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

    const user = await User.findOne({ where: { phoneNumber } });

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
    console.error("Login error:", err);
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

    const user = await User.findOne({ where: { phoneNumber } });

    // 🔥 JWT TOKEN (ENV use kar)
    const token = jwt.sign(
      { id: user.id, phoneNumber: user.phoneNumber },
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
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= AUTH MIDDLEWARE =================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET || "secret123", (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// ================= WORKER APIS =================

// 1. Get Profile
app.get("/api/worker/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Calculate stats
    const totalJobs = await Job.count({ where: { workerId: req.user.id, status: 'completed' } });
    
    res.json({
      success: true,
      data: {
        ...user.toJSON(),
        rating: 4.8, // Dummy rating for now until review system is built
        jobsCompleted: totalJobs
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 2. Get Available & Active Jobs
app.get("/api/worker/jobs", authenticateToken, async (req, res) => {
  try {
    const pendingJobs = await Job.findAll({ 
      where: { status: 'pending' },
      include: [{ model: User, as: 'customer', attributes: ['fullName', 'phoneNumber'] }],
      order: [['createdAt', 'DESC']]
    });
    
    const activeJobs = await Job.findAll({
      where: { workerId: req.user.id, status: 'accepted' },
      include: [{ model: User, as: 'customer', attributes: ['fullName', 'phoneNumber'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, pendingJobs, activeJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 3. Accept Job
app.post("/api/worker/jobs/:id/accept", authenticateToken, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.status !== 'pending') return res.status(400).json({ message: "Job is no longer available" });

    job.status = 'accepted';
    job.workerId = req.user.id;
    await job.save();

    res.json({ success: true, message: "Job accepted successfully", job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 4. Get Wallet Details
app.get("/api/worker/wallet", authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { workerId: req.user.id },
      order: [['date', 'DESC']]
    });

    const balance = transactions.reduce((acc, curr) => {
      return curr.type === 'credit' ? acc + curr.amount : acc - curr.amount;
    }, 0);

    res.json({ success: true, balance, transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});