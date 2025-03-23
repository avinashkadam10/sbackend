require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const { HoldingsModel } = require("./models/HoldingsModel");
const { PositionsModel } = require("./models/PositionsModel");
const { OrdersModel } = require("./models/OrdersModel");

const authRoutes = require("./routes/auth"); // Authentication Routes
const authMiddleware = require("./middleware/auth"); // Ensure this file exists!

const PORT = process.env.PORT || 3002;
const MONGO_URL = process.env.MONGO_URL;

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Authentication Routes
app.use("/api/auth", authRoutes);

// Protected Routes (Require Authentication)
app.get("/allholdings", authMiddleware, async (req, res) => {
  try {
    let allholdings = await HoldingsModel.find({});
    res.json(allholdings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching holdings", error });
  }
});

app.get("/allPositions", authMiddleware, async (req, res) => {
  try {
    let allPositions = await PositionsModel.find({});
    res.json(allPositions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching positions", error });
  }
});

// Order Placement
app.post("/newOrder", authMiddleware, async (req, res) => {
  try {
    let newOrder = new OrdersModel({
      name: req.body.name,
      qty: req.body.qty,
      price: req.body.price,
      mode: req.body.mode,
    });

    await newOrder.save(); // Use `await` to ensure it is saved properly
    res.json({ message: "Order saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error saving order", error });
  }
});

// Connect to MongoDB and Start Server
mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ DB connected!");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1); // Exit the app if DB connection fails
  });
