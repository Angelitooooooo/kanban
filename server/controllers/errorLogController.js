const { db } = require("../db");

// Save error log
const saveErrorLog = async (req, res) => {
  try {
    const { route, error } = req.body;

    // Validate required fields
    if (!error) {
      return res.status(400).json({ error: "Error message is required" });
    }

    const errorLog = await db("error_logs").insert({
      route: route || null,
      error: error,
    });

    res.status(201).json({
      id: errorLog[0],
      message: "Error log saved successfully",
    });
  } catch (error) {
    console.error("Error saving error log:", error);
    res.status(500).json({
      error: "Failed to save error log",
      details: error.message,
    });
  }
};

// Get all error logs
const getAllErrorLogs = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const errorLogs = await db("error_logs")
      .select("*")
      .orderBy("created_at", "desc")
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    const totalCount = await db("error_logs").count("* as count").first();

    res.status(200).json({
      data: errorLogs,
      total: totalCount.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("Error fetching error logs:", error);
    res.status(500).json({
      error: "Failed to fetch error logs",
      details: error.message,
    });
  }
};

// Get error logs by route
const getErrorLogsByRoute = async (req, res) => {
  try {
    const { route } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const errorLogs = await db("error_logs")
      .where("route", route)
      .select("*")
      .orderBy("created_at", "desc")
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    const totalCount = await db("error_logs")
      .where("route", route)
      .count("* as count")
      .first();

    res.status(200).json({
      data: errorLogs,
      total: totalCount.count,
      route: route,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("Error fetching error logs by route:", error);
    res.status(500).json({
      error: "Failed to fetch error logs",
      details: error.message,
    });
  }
};

// Delete error log by ID
const deleteErrorLog = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db("error_logs").where("id", id).del();

    if (result === 0) {
      return res.status(404).json({ error: "Error log not found" });
    }

    res.status(200).json({ message: "Error log deleted successfully" });
  } catch (error) {
    console.error("Error deleting error log:", error);
    res.status(500).json({
      error: "Failed to delete error log",
      details: error.message,
    });
  }
};

// Clear all error logs
const clearAllErrorLogs = async (req, res) => {
  try {
    await db("error_logs").del();

    res.status(200).json({ message: "All error logs cleared successfully" });
  } catch (error) {
    console.error("Error clearing error logs:", error);
    res.status(500).json({
      error: "Failed to clear error logs",
      details: error.message,
    });
  }
};

module.exports = {
  saveErrorLog,
  getAllErrorLogs,
  getErrorLogsByRoute,
  deleteErrorLog,
  clearAllErrorLogs,
};
