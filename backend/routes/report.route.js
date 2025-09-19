const router = require("express").Router();
const { createIssue, getIssueById, updateIssue, listIssues } = require("../controller/report.controller");

// Create new issue
router.post("/", createIssue);

// List issues with optional filters
router.get("/", listIssues);

// Get specific issue by issueId
router.get("/:issueId", getIssueById);

// Update issue by issueId
router.patch("/:issueId", updateIssue);

module.exports = router;


