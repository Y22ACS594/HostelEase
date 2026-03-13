const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  addStudent,
  allocateRoom,
  getAllStudents,
  getStudentDetails,
  getRoomsWithBeds,
  deleteStudent,
  getOccupiedBeds,
  getBedDetails,
  removeBed,
  updateStudent
} = require("../controllers/wardenController");

const {
  getAllLeaves,
  updateLeaveStatus,
} = require("../controllers/leaveController");


// ======================
// STUDENT MANAGEMENT
// ======================

// Add Student
router.post(
  "/students",
  protect,
  authorize("warden"),
  addStudent
);

// Get All Students
router.get(
  "/students",
  protect,
  authorize("warden"),
  getAllStudents
);

// Get Full Student Details
router.get(
  "/students/:id",
  protect,
  authorize("warden"),
  getStudentDetails
);

// Update Student
router.put(
  "/students/:id",
  protect,
  authorize("warden"),
  updateStudent
);

// Delete Student
router.delete(
  "/students/:id",
  protect,
  authorize("warden"),
  deleteStudent
);


// ======================
// ROOM MANAGEMENT
// ======================

// Get Rooms With Beds (fast API)
router.get(
  "/rooms-with-beds",
  protect,
  authorize("warden"),
  getRoomsWithBeds
);

// Allocate Room
router.post(
  "/allocate-room",
  protect,
  authorize("warden"),
  allocateRoom
);

// Get Bed Details
router.get(
  "/rooms/:roomId/bed/:bedNumber",
  protect,
  authorize("warden"),
  getBedDetails
);

// Deallocate Bed (Checkout)
router.delete(
  "/bed/:allocationId",
  protect,
  authorize("warden"),
  removeBed
);


// ======================
// LEAVE MANAGEMENT
// ======================

// View all leave requests
router.get(
  "/leaves",
  protect,
  authorize("warden"),
  getAllLeaves
);

// Approve / Reject leave
router.put(
  "/leaves/:id",
  protect,
  authorize("warden"),
  updateLeaveStatus
);


module.exports = router;