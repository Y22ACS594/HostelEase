// ============================================================
// controllers/analyticsController.js
// Req 10: Hostel analytics — students, rooms, leaves, complaints
// ============================================================
const Student = require("../models/Student");
const Room = require("../models/Room");
const RoomAllocation = require("../models/RoomAllocation");
const LeaveRequest = require("../models/LeaveRequest");
const AuditLog = require("../models/AuditLog");


/* ═══════════════════════════════════════════════════════════
   HOSTEL OVERVIEW  (warden dashboard)
═══════════════════════════════════════════════════════════ */
exports.getOverview = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalRooms,
      totalBeds,
      occupiedBeds,
      pendingLeaves,
      approvedLeavesThisMonth,
      recentActivity,
    ] = await Promise.all([
      Student.countDocuments(),
      Room.countDocuments(),
      Room.aggregate([{ $group: { _id: null, total: { $sum: "$totalBeds" } } }]),
      RoomAllocation.countDocuments({ status: "active" }),
      LeaveRequest.countDocuments({ status: "Pending" }),

      // Leaves approved this calendar month
      LeaveRequest.countDocuments({
        status: "Approved",
        updatedAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),

      // Last 10 audit log entries for "Recent Activity" feed
      AuditLog.find()
        .populate("actor", "name role")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const totalBedCount = totalBeds[0]?.total ?? 0;
    const vacantBeds = totalBedCount - occupiedBeds;

    res.json({
      cards: {
        totalStudents,
        totalRooms,
        totalBeds: totalBedCount,
        occupiedBeds,
        vacantBeds,
        occupancyRate: totalBedCount
          ? Math.round((occupiedBeds / totalBedCount) * 100)
          : 0,
        pendingLeaves,
        approvedLeavesThisMonth,
      },
      recentActivity,
    });
  } catch (err) { next(err); }
};


/* ═══════════════════════════════════════════════════════════
   LEAVE TRENDS  (last 6 months by status)
═══════════════════════════════════════════════════════════ */
exports.getLeaveTrends = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await LeaveRequest.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(trends);
  } catch (err) { next(err); }
};


/* ═══════════════════════════════════════════════════════════
   ROOM OCCUPANCY BREAKDOWN
═══════════════════════════════════════════════════════════ */
exports.getRoomOccupancy = async (req, res, next) => {
  try {
    const rooms = await Room.find().lean();
    const occupancy = rooms.map((r) => ({
      roomNumber: r.roomNumber,
      floor: r.floor,
      totalBeds: r.totalBeds,
      occupiedBeds: r.occupiedBeds,
      vacantBeds: r.totalBeds - r.occupiedBeds,
      occupancyPercent: Math.round((r.occupiedBeds / r.totalBeds) * 100),
    }));

    res.json(occupancy);
  } catch (err) { next(err); }
};
