const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

// Directory where each batch's kanban board data is persisted as a JSON file.
// This replaces the browser localStorage which is capped at ~5MB.
const STORAGE_DIR = path.join(__dirname, "..", "data", "stationTwo");
const LOGS_DIR = path.join(__dirname, "..", "logs");

// Build a safe file name from a batch name so it can be used on disk.
const fileFor = (name) => {
  const safe = String(name).replace(/[^a-zA-Z0-9_\- ]/g, "_").trim();
  return path.join(STORAGE_DIR, `${safe}.json`);
};

const backupFileFor = (name, timestamp) => {
  const safe = String(name).replace(/[^a-zA-Z0-9_\- ]/g, "_").trim();
  const safeTimestamp = timestamp.toISOString().replace(/[:.]/g, "-");
  return path.join(LOGS_DIR, `${safe}-${safeTimestamp}.json`);
};

const ensureDir = async () => {
  await fsp.mkdir(STORAGE_DIR, { recursive: true });
};

// GET /stationtwo/kanban/storage?name=<batchName>
// Returns the stored board data for a batch, or { data: null } if none exists.
const getStationTwoStorage = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: "Query parameter name is required." });
    }

    const file = fileFor(name);
    if (!fs.existsSync(file)) {
      return res.status(200).json({ name, data: null });
    }

    const raw = await fsp.readFile(file, "utf8");
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch (parseErr) {
      console.error(`Corrupt station two storage file for ${name}:`, parseErr);
      data = null;
    }

    res.status(200).json({ name, data });
  } catch (error) {
    console.error("Error reading station two storage:", error);
    res.status(500).json({ error: "Failed to read station two storage", details: error.message });
  }
};

// POST /stationtwo/kanban/storage  body: { name, data }
// Saves the board data for a batch to its JSON file.
const saveStationTwoStorage = async (req, res) => {
  try {
    const { name, data } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Field name is required." });
    }

    await ensureDir();
    const file = fileFor(name);
    if (fs.existsSync(file)) {
      await fsp.mkdir(LOGS_DIR, { recursive: true });
      await fsp.copyFile(file, backupFileFor(name, new Date()));
    }

    await fsp.writeFile(file, JSON.stringify(data), "utf8");

    res.status(200).json({ success: true, name });
  } catch (error) {
    console.error("Error saving station two storage:", error);
    res.status(500).json({ error: "Failed to save station two storage", details: error.message });
  }
};
function removeDuplicateQrData(data) {
  data.forEach(board => {
    board.columns.forEach(column => {
      const seen = new Set();

      column.items = column.items.map(item => {
        // Keep empty slots
        if (!item.qrData) {
          return item;
        }

        // Duplicate found
        if (seen.has(item.qrData)) {
          return {};
        }

        // First occurrence
        seen.add(item.qrData);
        return item;
      });
    });
  });

  return data;
}

module.exports = {
  getStationTwoStorage,
  saveStationTwoStorage,
};
