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
  saveQRScan,
  saveBarcodeScan,
  getAllKanbanPrints,
  getKanbanPrintsuserID,
  createKanbanPrint,
  updateKanbanPrint,
  getKabanHistory,
  saveKabanHistory,
  getKabanHistoryDate
} = require("./controllers/kanbanController");
const { getKanbanQAByDate, createKanbanQA, updateKanbanQAById, updateBarcodeById, updateKanbanQAAllFieldsById, deleteKanbanQAById } = require("./controllers/kanbanQa");
const {
  saveErrorLog,
  getAllErrorLogs,
  getErrorLogsByRoute,
  deleteErrorLog,
  clearAllErrorLogs
} = require("./controllers/errorLogController");
const { ValidateKanbanBarcode ,ValidateKanbanQR , getAllKanbanQA, getKanbanQAByDateAndKanban , updateKanbanQAValidatedQR,updateKanbanQAValidatedBarcode,GetKanban } = require('./controllers/StationTwoController');

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
router.post("/barcode-scan", saveBarcodeScan);
router.get("/kanbanqa", getKanbanQAByDate);
router.post("/kanbanqa", createKanbanQA);

// Update all fields of Kanban_qa by id
router.put("/kanbanqa/:id", updateKanbanQAAllFieldsById);
router.put("/kanbanqa/:id/qr", updateKanbanQAById);
router.put("/kanbanqa/:id/barcode", updateBarcodeById);

// Delete KanbanQA by id
router.delete("/kanbanqa/:id", deleteKanbanQAById);

// Kanban Print Routes
router.get("/kanban-prints", getAllKanbanPrints);
router.get("/kanban-prints/user/:userId", getKanbanPrintsuserID);
router.post("/kanban-prints", createKanbanPrint);
router.put("/kanban-prints/:id", updateKanbanPrint);

// Error Logs Routes
router.post("/error-logs", saveErrorLog);
router.get("/error-logs", getAllErrorLogs);
router.get("/error-logs/route/:route", getErrorLogsByRoute);
router.delete("/error-logs/:id", deleteErrorLog);
router.delete("/error-logs", clearAllErrorLogs);

// Station Two API
router.get('/stationtwo/kanbanqa', getAllKanbanQA);
router.get('/stationtwo/kanbanqa/filter', getKanbanQAByDateAndKanban);
router.patch('/stationtwo/kanbanqa/validate/qr', updateKanbanQAValidatedQR);
router.patch('/stationtwo/kanbanqa/validate/barcode', updateKanbanQAValidatedBarcode);
router.get('/stationtwo/kanban', GetKanban);
router.post('/stationtwo/kanban/validate/qr', ValidateKanbanQR);
router.post('/stationtwo/kanban/validate/barcode', ValidateKanbanBarcode);
router.get('/stationtwo/kanban/validate/barcode', ValidateKanbanBarcode);
router.get('/stationtwo/kanban/history', getKabanHistory);
router.post('/stationtwo/kanban/history', saveKabanHistory);
router.get('/stationtwo/kanban/history/date', getKabanHistoryDate);



module.exports = router;
