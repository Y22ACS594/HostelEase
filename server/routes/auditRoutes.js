// routes/auditRoutes.js
const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const AuditLog = require("../models/AuditLog");

// Paginated audit log — admin/warden only
router.get("/", protect, authorize("admin", "warden"), async (req, res, next) => {
  try {
    const { page = 1, limit = 30, action } = req.query;
    const filter = action ? { action } : {};
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("actor", "name role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      AuditLog.countDocuments(filter),
    ]);
    res.json({ logs, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

module.exports = router;
