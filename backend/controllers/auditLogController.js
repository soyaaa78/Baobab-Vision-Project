const AuditLog = require("../models/AuditLog");

// GET /api/audit-logs?eventType=&action=&actor=&targetModel=&targetId=&page=&limit=
exports.list = async (req, res) => {
  try {
    const {
      eventType,
      action,
      actor,
      targetModel,
      targetId,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};
    if (eventType) query.eventType = eventType;
    if (action) query.action = action;
    if (actor) query.actor = actor;
    if (targetModel) query.targetModel = targetModel;
    if (targetId) query.targetId = targetId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("actor", "firstname lastname email username role");

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      message: "Audit logs fetched",
      data: logs,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    console.error("AuditLog list error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
