const express = require("express");
const { login, register, getAllUsers, createUser, updateUser, deleteUser } = require("./controllers/userController");
const {
  getAllKanbans,
  getKanbanStatistics,
  exportAllKanbanData,
  getKanbanByName,
  getKanbanData,
  getKanbanFullData,
  getKanbanColumns,
  getAllKanbanSetData,
  createKanban,
  saveQRScan
} = require("./controllers/kanbanController");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

router.get("/", (req, res) => {
  res.status(200).json({ message: "Kanban API" });
});

router.post("/auth/login", login);
router.post("/auth/register", register);

// User Management Routes
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Kanban Management Routes
router.get("/kanbans", getAllKanbans);
router.get("/kanbans/statistics", getKanbanStatistics);
router.get("/export", exportAllKanbanData);
router.get("/kanbans/name/:name", getKanbanByName);
router.get("/kanbans/:id/data", getKanbanData);
router.get("/kanbans/:id/full", getKanbanFullData);
router.get("/kanbans/:id/columns", getKanbanColumns);
router.get("/kanban-set/all", getAllKanbanSetData);
router.post("/kanbans", createKanban);
router.post("/qr-scan", saveQRScan);

module.exports = router;
