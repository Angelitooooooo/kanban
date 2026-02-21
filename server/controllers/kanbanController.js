const { db } = require("../db");

// Get all kanbans (batches) - filtered by station if provided
const getAllKanbans = async (req, res) => {
  try {
    const { station } = req.query;
    
    let query = db('kanbans');
    
    if (station) {
      query = query.where('station', station);
    }
    
    const kanbans = await query.select('*').orderBy('id', 'desc');
    res.status(200).json(kanbans);
  } catch (error) {
    console.error("Error fetching kanbans:", error);
    res.status(500).json({ error: "Failed to fetch kanbans", details: error.message });
  }
};

// Get statistics for all kanbans
const getKanbanStatistics = async (req, res) => {
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
};

// Export all kanban data as JSON
const exportAllKanbanData = async (req, res) => {
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
};

// Get kanban data by name
const getKanbanByName = async (req, res) => {
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
};

// Get kanban_set data for a specific batch - filtered by station if provided
const getKanbanData = async (req, res) => {
  try {
    const { id } = req.params;
    const { station } = req.query;
    
    // First verify the batch exists and belongs to the station
    let batchQuery = db('kanbans').where('id', id);
    if (station) {
      batchQuery = batchQuery.where('station', station);
    }
    
    const batch = await batchQuery.first();
    if (!batch) {
      return res.status(404).json({ error: "Batch not found or access denied" });
    }
    
    // Fetch data for the batch
    let dataQuery = db('kanban_set').where('batchID', id);
    if (station) {
      dataQuery = dataQuery.where('station', station);
    }
    
    const kanbanSetData = await dataQuery
      .select('*')
      .orderBy('rowPage', 'asc')
      .orderBy('row', 'asc');
    
    res.status(200).json(kanbanSetData);
  } catch (error) {
    console.error("Error fetching kanban set data:", error);
    res.status(500).json({ error: "Failed to fetch kanban set data", details: error.message });
  }
};

// Get kanban_set data for a batch with kanban details
const getKanbanFullData = async (req, res) => {
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
};

// Get kanban_set items by column
const getKanbanColumns = async (req, res) => {
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
};

// Get all kanban_set data (raw)
const getAllKanbanSetData = async (req, res) => {
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
};

// Create a new kanban (batch)
const createKanban = async (req, res) => {
  try {
    const { name, station, userId } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Batch name is required" });
    }
    
    let data_set = '40'; // Default value
    
    // If userId is provided, fetch data_set from users table
    if (userId) {
      const user = await db('users').where('id', userId).select('data_set').first();
      if (user && user.data_set) {
        data_set = user.data_set;
      }
    }
    
    const [insertId] = await db('kanbans').insert({
      name: name,
      data_set: data_set,
      station: station
    });
    
    const newKanban = await db('kanbans').where('id', insertId).first();
    
    console.log("New batch created:", newKanban);
    res.status(201).json(newKanban);
  } catch (error) {
    console.error("Error creating kanban:", error);
    res.status(500).json({ error: "Failed to create kanban", details: error.message });
  }
};

// Save QR scan data
const saveQRScan = async (req, res) => {
  try {
    const { value, row, column, batchKey, rowPage, station } = req.body;

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
      value: value,
      station: station
    });

    console.log("QR scan saved to database:", {
      id: insertId,
      columnName: column,
      row,
      batchID,
      rowPage,
      value,
      station
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
};

// Get all kanban print records
const getAllKanbanPrints = async (req, res) => {
  try {
    const { user_id, all } = req.query;
    
    let query = db('kanban_print');
    
    // If 'all' parameter is true, return all records without filtering
    if (all !== 'true' && user_id) {
      query = query.where('user_id', user_id);
    }
    
    const kanbanPrints = await query.select('*').orderBy('id', 'desc');
    res.status(200).json(kanbanPrints);
  } catch (error) {
    console.error("Error fetching kanban prints:", error);
    res.status(500).json({ error: "Failed to fetch kanban prints", details: error.message });
  }
};

// Get kanban print records for Station 1 (user_id: 11)
const getKanbanPrintsStation1 = async (req, res) => {
  try {
    const kanbanPrints = await db('kanban_print')
      .where('user_id', 11)
      .select('*')
      .orderBy('id', 'desc');
    
    res.status(200).json(kanbanPrints);
  } catch (error) {
    console.error("Error fetching kanban prints for Station 1:", error);
    res.status(500).json({ error: "Failed to fetch kanban prints for Station 1", details: error.message });
  }
};

// Create/Save a kanban print record
const createKanbanPrint = async (req, res) => {
  try {
    const { kanban, printCopies, user_id } = req.body;
    
    if (!kanban) {
      return res.status(400).json({ error: "Kanban value is required" });
    }
    
    const newKanbanPrint = {
      kanban,
      printCopies: printCopies || 0,
      user_id: user_id || 1
    };
    
    const result = await db('kanban_print').insert(newKanbanPrint);
    
    res.status(201).json({ 
      id: result[0],
      message: "Kanban print record saved successfully",
      data: newKanbanPrint
    });
  } catch (error) {
    console.error("Error creating kanban print:", error);
    res.status(500).json({ error: "Failed to save kanban print", details: error.message });
  }
};

// Update a kanban print record
const updateKanbanPrint = async (req, res) => {
  try {
    const { id } = req.params;
    const { printCopies } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: "Kanban print ID is required" });
    }
    
    const updated = await db('kanban_print')
      .where('id', id)
      .update({ printCopies });
    
    if (updated === 0) {
      return res.status(404).json({ error: "Kanban print record not found" });
    }
    
    res.status(200).json({ 
      id,
      message: "Kanban print record updated successfully",
      printCopies
    });
  } catch (error) {
    console.error("Error updating kanban print:", error);
    res.status(500).json({ error: "Failed to update kanban print", details: error.message });
  }
};

module.exports = {
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
  getAllKanbanPrints,
  getKanbanPrintsStation1,
  createKanbanPrint,
  updateKanbanPrint
};
