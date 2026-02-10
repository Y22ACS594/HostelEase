require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("node:dns");

// 1. FORCE DNS RESOLUTION
// This fixes the 'querySrv ECONNREFUSED' by bypassing your router's 
// local DNS and using Google's Public DNS.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// Ensure these files exist in your 'routes' folder
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/warden", require("./routes/wardenRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/leave", require("./routes/leaveRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));

// Default Route for Testing
app.get("/", (req, res) => {
  res.send("Hostel Management System API is running...");
});

// 2. MONGODB CONNECTION WITH TIMEOUT PROTECTION
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
    // These settings prevent the app from hanging on slow Wi-Fi
    serverSelectionTimeoutMS: 5000, 
    socketTimeoutMS: 45000,
})
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:");
    console.error(err.message);
    
    // Specific advice for Network Errors
    if (err.message.includes("ECONNREFUSED") || err.message.includes("querySrv")) {
      console.log("\n⚠️  NETWORK ALERT:");
      console.log("- Your current Wi-Fi might be blocking Port 27017.");
      console.log("- Go to MongoDB Atlas -> Network Access and add '0.0.0.0/0' to allow all networks.");
      console.log("- Try switching to a Mobile Hotspot to confirm if it's a Wi-Fi restriction.");
    }
  });

// 3. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});