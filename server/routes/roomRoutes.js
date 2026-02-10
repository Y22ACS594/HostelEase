const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const Room = require("../models/Room");

/* ===============================
   WARDEN → CREATE ROOM
================================ */
router.post(
  "/",
  protect,
  authorize("warden"),
  async (req, res) => {
    try {
      const { blockName, roomNumber, totalBeds } = req.body;

      if (!blockName || !roomNumber || !totalBeds) {
        return res.status(400).json({ message: "All fields required" });
      }

      // Prevent duplicate room
      const existingRoom = await Room.findOne({
        blockName,
        roomNumber,
      });

      if (existingRoom) {
        return res.status(400).json({ message: "Room already exists" });
      }

      const room = await Room.create({
        blockName,
        roomNumber,
        totalBeds,
        occupiedBeds: 0,
      });

      res.status(201).json(room);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ===============================
   WARDEN → GET ALL ROOMS
================================ */
router.get(
  "/",
  protect,
  authorize("warden"),
  async (req, res) => {
    try {
      const rooms = await Room.find().sort({ blockName: 1 });
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/* ===============================
   STUDENT → VIEW AVAILABLE ROOMS
================================ */
router.get(
  "/available",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const rooms = await Room.find({
        $expr: { $lt: ["$occupiedBeds", "$totalBeds"] }
      });

      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
