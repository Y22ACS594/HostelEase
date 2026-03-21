// routes/issueRoutes.js
const router   = require("express").Router();
const protect  = require("../middleware/authMiddleware");
const authorize= require("../middleware/roleMiddleware");
const {
  raiseIssue,
  getMyIssues,
  getAllIssues,
  updateIssueStatus,
  getIssueStats,
} = require("../controllers/issueController");

// Student
router.post  ("/",          protect, authorize("student"),         raiseIssue);
router.get   ("/my",        protect, authorize("student"),         getMyIssues);

// Warden
router.get   ("/",          protect, authorize("warden","admin"),  getAllIssues);
router.get   ("/stats",     protect, authorize("warden","admin"),  getIssueStats);
router.patch ("/:id/status",protect, authorize("warden","admin"),  updateIssueStatus);

module.exports = router;