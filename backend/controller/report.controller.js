const Issue = require("../database/models/Issue");

// POST /api/report
const createIssue = async (req, res) => {
  try {
    console.log("[createIssue] Incoming request body:", JSON.stringify(req.body, null, 2));
    const {
      title,
      details,
      category,
      photoUrl,
      reporter,
      location,
    } = req.body;

    if (!title || !details || !category || !reporter?.username || !reporter?.email || !reporter?.phone) {
      console.error("[createIssue] Missing required fields", { title, details, category, reporter });
      return res.status(400).json({ message: "Missing required fields" });
    }

    const issueId = `CIV-${String(Date.now()).slice(-6)}`;
    try {
      const issue = await Issue.create({
        issueId,
        title,
        details,
        category,
        photoUrl,
        reporter,
        location,
      });
      console.log("[createIssue] Issue created successfully:", issue);
      return res.status(201).json({ message: "Issue reported", issue });
    } catch (dbError) {
      console.error("[createIssue] Error while saving issue to DB:", dbError);
      return res.status(500).json({ message: "Failed to create issue (DB error)", error: dbError.message });
    }
  } catch (error) {
    console.error("[createIssue] Unexpected error:", error);
    return res.status(500).json({ message: "Failed to create issue (unexpected error)", error: error.message });
  }
};

// GET /api/report/:issueId
const getIssueById = async (req, res) => {
  try {
    const { issueId } = req.params;
    const issue = await Issue.findOne({ issueId });
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    return res.status(200).json({ issue });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch issue", error: error.message });
  }
};

// PATCH /api/report/:issueId
const updateIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const update = req.body || {};
    const issue = await Issue.findOneAndUpdate({ issueId }, update, { new: true });
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    return res.status(200).json({ message: "Issue updated", issue });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update issue", error: error.message });
  }
};

// GET /api/report (optional filters)
const listIssues = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    const issues = await Issue.find(filter).sort({ createdAt: -1 }).limit(200);
    return res.status(200).json({ issues });
  } catch (error) {
    return res.status(500).json({ message: "Failed to list issues", error: error.message });
  }
};

module.exports = { createIssue, getIssueById, updateIssue, listIssues };


