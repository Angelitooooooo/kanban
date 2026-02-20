const express = require("express");
const { login, register } = require("./controllers/userController");
const { db } = require("./db");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

router.get("/", (req, res) => {
  res.status(200).json({ message: "Kanban API" });
});

router.post("/auth/login", login);
router.post("/auth/register", register);

// Get all kanbans (batches)
router.get("/kanbans", async (req, res) => {
  try {
    const kanbans = await db('kanbans').select('*').orderBy('id', 'desc');
    res.status(200).json(kanbans);
  } catch (error) {
    console.error("Error fetching kanbans:", error);
    res.status(500).json({ error: "Failed to fetch kanbans", details: error.message });
  }
});

// Get statistics for all kanbans
router.get("/kanbans/statistics", async (req, res) => {
  try {
    const kanbans = await db('kanbans').select('*').orderBy('id', 'desc');
    
    const statistics = await Promise.all(
      kanbans.map(async (kanban) => {
        const kanbanSetData = await db('kanban_set')
          .where('batchID', kanban.id)
          .select('*');
        
        const groupedByColumn = {};
        kanbanSetData.forEach((item) => {
          if (!groupedByColumn[item.columnName]) {
            groupedByColumn[item.columnName] = [];
          }
          groupedByColumn[item.columnName].push(item);
        });
        
        return {
          id: kanban.id,
          name: kanban.name,
          data_set: kanban.data_set,
          totalItems: kanbanSetData.length,
          itemsByColumn: groupedByColumn,
          columnSummary: Object.keys(groupedByColumn).map(col => ({
            column: col,
            count: groupedByColumn[col].length
          }))
        };
      })
    );
    
    res.status(200).json(statistics);
  } catch (error) {
    console.error("Error fetching kanban statistics:", error);
    res.status(500).json({ error: "Failed to fetch kanban statistics", details: error.message });
  }
});

// Export all kanban data as JSON
router.get("/export", async (req, res) => {
  try {
    const kanbans = await db('kanbans').select('*').orderBy('id', 'desc');
    const allKanbanSetData = await db('kanban_set').select('*').orderBy('batchID', 'asc').orderBy('row', 'asc');
    
    const exportData = {
      exportDate: new Date().toISOString(),
      kanbans: kanbans,
      kanbanSetData: allKanbanSetData,
      summary: {
        totalBatches: kanbans.length,
        totalItems: allKanbanSetData.length
      }
    };
    
    res.status(200).json(exportData);
  } catch (error) {
    console.error("Error exporting data:", error);
    res.status(500).json({ error: "Failed to export data", details: error.message });
  }
});

// Get kanban data by name
router.get("/kanbans/name/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const kanban = await db('kanbans').where('name', 'like', `%${name}%`).select('*');
    
    if (kanban.length === 0) {
      return res.status(404).json({ error: `Kanban '${name}' not found` });
    }
    
    // Fetch data for all matching kanbans
    const kanbansWithData = await Promise.all(
      kanban.map(async (k) => {
        const kanbanSetData = await db('kanban_set')
          .where('batchID', k.id)
          .select('*')
          .orderBy('rowPage', 'asc')
          .orderBy('row', 'asc');
        
        return {
          ...k,
          data: kanbanSetData
        };
      })
    );
    
    res.status(200).json(kanbansWithData);
  } catch (error) {
    console.error("Error fetching kanban by name:", error);
    res.status(500).json({ error: "Failed to fetch kanban by name", details: error.message });
  }
});

// Get kanban_set data for a specific batch
router.get("/kanbans/:id/data", async (req, res) => {
  try {
    const { id } = req.params;
    const kanbanSetData = await db('kanban_set')
      .where('batchID', id)
      .select('*')
      .orderBy('rowPage', 'asc')
      .orderBy('row', 'asc');
    
    res.status(200).json(kanbanSetData);
  } catch (error) {
    console.error("Error fetching kanban set data:", error);
    res.status(500).json({ error: "Failed to fetch kanban set data", details: error.message });
  }
});

// Get kanban_set data for a batch with kanban details
router.get("/kanbans/:id/full", async (req, res) => {
  try {
    const { id } = req.params;
    const kanban = await db('kanbans').where('id', id).first();
    
    if (!kanban) {
      return res.status(404).json({ error: "Kanban not found" });
    }
    
    const kanbanSetData = await db('kanban_set')
      .where('batchID', id)
      .select('*')
      .orderBy('rowPage', 'asc')
      .orderBy('row', 'asc');
    
    res.status(200).json({
      ...kanban,
      data: kanbanSetData
    });
  } catch (error) {
    console.error("Error fetching kanban full data:", error);
    res.status(500).json({ error: "Failed to fetch kanban full data", details: error.message });
  }
});

// Get kanban_set items by column
router.get("/kanbans/:id/columns", async (req, res) => {
  try {
    const { id } = req.params;
    const kanbanSetData = await db('kanban_set')
      .where('batchID', id)
      .select('*')
      .orderBy('columnName', 'asc');
    
    // Group by column
    const groupedByColumn = {};
    kanbanSetData.forEach((item) => {
      if (!groupedByColumn[item.columnName]) {
        groupedByColumn[item.columnName] = [];
      }
      groupedByColumn[item.columnName].push(item);
    });
    
    res.status(200).json(groupedByColumn);
  } catch (error) {
    console.error("Error fetching kanban columns:", error);
    res.status(500).json({ error: "Failed to fetch kanban columns", details: error.message });
  }
});

// Get all kanban_set data (raw)
router.get("/kanban-set/all", async (req, res) => {
  try {
    const allData = await db('kanban_set')
      .select('*')
      .orderBy('batchID', 'asc')
      .orderBy('row', 'asc');
    
    res.status(200).json(allData);
  } catch (error) {
    console.error("Error fetching all kanban_set data:", error);
    res.status(500).json({ error: "Failed to fetch all kanban_set data", details: error.message });
  }
});

// Create a new kanban (batch)
router.post("/kanbans", async (req, res) => {
  try {
    const { name, data_set } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Batch name is required" });
    }
    
    const [insertId] = await db('kanbans').insert({
      name: name,
      data_set: data_set || '42'
    });
    
    const newKanban = await db('kanbans').where('id', insertId).first();
    
    console.log("New batch created:", newKanban);
    res.status(201).json(newKanban);
  } catch (error) {
    console.error("Error creating kanban:", error);
    res.status(500).json({ error: "Failed to create kanban", details: error.message });
  }
});

router.post("/qr-scan", async (req, res) => {
  try {
    const { value, row, column, batchKey, rowPage } = req.body;

    // Validate required fields
    if (!value || !row || !column) {
      return res.status(400).json({ error: "Missing required fields: value, row, column" });
    }

    // Determine batchID: if batchKey is a number, use it directly; otherwise look up by name
    let batchID = batchKey;
    
    if (batchKey && isNaN(batchKey)) {
      // Look up kanban by name
      const kanban = await db('kanbans').where('name', batchKey).first();
      if (kanban) {
        batchID = kanban.id;
      } else {
        return res.status(404).json({ error: `Kanban batch '${batchKey}' not found` });
      }
    }

    // Insert into kanban_set table
    const [insertId] = await db('kanban_set').insert({
      columnName: column,
      row: row,
      batchID: batchID || null,
      rowPage: rowPage || 1,
      value: value
    });

    console.log("QR scan saved to database:", {
      id: insertId,
      columnName: column,
      row,
      batchID,
      rowPage,
      value
    });

    res.status(201).json({ 
      status: "success", 
      id: insertId,
      message: "QR scan data saved successfully" 
    });
  } catch (error) {
    console.error("Error saving QR scan:", error);
    res.status(500).json({ error: "Failed to save QR scan data", details: error.message });
  }
});

module.exports = router;
