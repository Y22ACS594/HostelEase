// ============================================================
// utils/auditLogger.js
// Req 11: Helper to write audit log entries
// ============================================================
const AuditLog = require("../models/AuditLog");

/**
 * @param {Object} params
 * @param {string} params.actor     - User._id of the person performing the action
 * @param {string} params.actorRole - "admin" | "warden" | "student"
 * @param {string} params.action    - e.g. "STUDENT_REGISTERED"
 * @param {string} [params.targetModel]
 * @param {string} [params.targetId]
 * @param {string} params.description
 * @param {Object} [params.meta]
 * @param {string} [params.ip]
 */
const auditLog = async (params) => {
  try {
    await AuditLog.create(params);
  } catch (err) {
    // Never let audit logging crash the main request flow
    console.error("AuditLog write failed:", err.message);
  }
};

module.exports = auditLog;
