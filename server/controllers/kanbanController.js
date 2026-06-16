const { db } = require("../db");
const getKabanHistoryDate = async (req, res) => {

      let  { kanban } = req.query;
      console.log("test", kanban);
  try {
    
        const result = await db('kanban_qa')
        .select('kanban_set')
        .max('updated_at as updated_at')
        .where('kanban', 'like', `%${kanban}%`)
        .whereNotNull('kanban_set')
        .groupBy('kanban_set')
         .orderBy('updated_at', 'desc');
        
      res.status(200).json(result.map(r => ({
        kanban_set: r.kanban_set,
        updated_at: new Date(r.updated_at).toISOString().split('T')[0]
      })));


  } catch (error) {
        console.error("Error fetching kanbans:", error);
    res.status(500).json({ error: "Failed to fetch kanbans", details: error.message });
  }




}


const saveKabanHistory = async (req, res) => {
    try {
      let  { data,kanban } = req.body;


            let kanban_set = await db('kanban_qa')
            .select('Kanban_set')
            .where(
            'kanban_set',
            db('kanban_qa')
            .max('kanban_set')
            .where('kanban', 'like', `%${kanban}%`)
            ).first();

            if(!kanban_set){
              console.log("No existing kanban_set found for kanban:", kanban);
              kanban_set = { Kanban_set: 0 };
            }

      for (const column of data.columns) {
        for (const item of column.items) {
          if(Object.keys(item).length != 0){
            const result = await db('Kanban_qa')
              .select('id')
              .where('qr_kanban', item.qrData)
              .first();
              if(result) {
                await db('Kanban_qa')                .where('id', result.id)
                .update({kanban_set: kanban_set.Kanban_set+1 , updated_at: new Date()});
              }
              console.log(result);
          }
        }
      }
      res.status(200).json(data);

  } catch (error) {
    console.error("Error fetching kanbans:", error);
    res.status(500).json({ error: "Failed to fetch kanbans", details: error.message });
  }

  

}


const getKabanHistory = async (req, res) => {
    const { set,kanban } = req.query;
    console.log("Fetching history for kanban_set:", set);

  try {
      const kanbanSetData = await db('kanban_qa')
          .where('kanban_set', set)
          .where('kanban', 'like', `%${kanban}%`)
          .select('*');
        res.status(200).json(kanbanSetData);

  } catch (error) {
    console.error("Error fetching kanbans:", error);
    res.status(500).json({ error: "Failed to fetch kanbans", details: error.message });
  }
};


// Get all kanbans (batches) - filtered by station if provided
const getAllKanbans = async (req, res) => {
  try {
    const { station } = req.query;
    // Check for admin user
    const isAdmin = req.user && (req.user.isAdmin || req.user.role === 'admin');
    let query = db('kanbans');
    if (station && !isAdmin) {
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

    // Validate required fields (value can be null for row markers)
    if (!row || !column) {
      return res.status(400).json({ error: "Missing required fields: row, column" });
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

    // Update existing row if present (preserve barcode), otherwise insert
    let existingQuery = db('kanban_set')
      .where('columnName', column)
      .where('row', row)
      .where('batchID', batchID || null);

    if (station) {
      existingQuery = existingQuery.where('station', station);
    }

    const existingRow = await existingQuery.first();

    const hasValue = value !== null && value !== undefined && value !== '';

    if (existingRow) {
      // Only update if value is not null, otherwise skip update
      if (hasValue) {
        await db('kanban_set')
          .where('id', existingRow.id)
          .update({
            value: value,
            rowPage: (rowPage !== undefined && rowPage !== null) ? rowPage : (existingRow.rowPage !== undefined && existingRow.rowPage !== null ? existingRow.rowPage : 1),
            station: station || existingRow.station,
            updated_at: new Date()
          });
        console.log("QR scan updated existing row:", {
          id: existingRow.id,
          columnName: column,
          row,
          batchID,
          rowPage: (rowPage !== undefined && rowPage !== null) ? rowPage : (existingRow.rowPage !== undefined && existingRow.rowPage !== null ? existingRow.rowPage : 1),
          value: value,
          station: station || existingRow.station
        });
        return res.status(200).json({
          status: "updated",
          id: existingRow.id,
          message: "QR scan data updated successfully"
        });
      } else {
        // If value is null and row exists, do not insert or update
        return res.status(200).json({
          status: "skipped",
          id: existingRow.id,
          message: "QR scan with null value skipped (row already exists)"
        });
      }
    }

    // Only insert if value is not null
    if (hasValue) {
      const [insertId] = await db('kanban_set').insert({
        columnName: column,
        row: row,
        batchID: batchID || null,
        rowPage: (rowPage !== undefined && rowPage !== null) ? rowPage : 1,
        value: value,
        station: station || 2
      });
      console.log("QR scan saved to database:", {
        id: insertId,
        columnName: column,
        row,
        batchID,
        rowPage: (rowPage !== undefined && rowPage !== null) ? rowPage : 1,
        value,
        station
      });
      return res.status(201).json({ 
        status: "success", 
        id: insertId,
        message: "QR scan data saved successfully" 
      });
    } else {
      // If value is null and no row exists, do not insert
      return res.status(200).json({
        status: "skipped",
        message: "QR scan with null value skipped (no row to insert)"
      });
    }
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

// Get kanban print records for a specific user
const getKanbanPrintsuserID = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    const kanbanPrints = await db('kanban_print')
      .where('user_id', userId)
      .select('*')
      .orderBy('id', 'desc');
    
    res.status(200).json(kanbanPrints);
  } catch (error) {
    console.error("Error fetching kanban prints for station:", error);
    res.status(500).json({ error: "Failed to fetch kanban prints for station", details: error.message });
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
    
    // Trim the kanban value based on specification prefix
    let trimmedKanban = kanban.startsWith('RR Cushion')
      ? kanban.slice(11)
      : kanban.slice(7);
    
    // Check if trimmed kanban exists in kanban table
    const existingRecord = await db('kanbans')
      .where('name', trimmedKanban)
      .first();
    
    // If not existing, insert into kanban table
    if (!existingRecord) {
      await db('kanbans').insert({
        name: trimmedKanban,
        data_set: '40',
        created_at: new Date(),
        station : "2"
      });
    }
    
    // Emit socket event to refresh data for station 2 users

    
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

// Save barcode scan data
const saveBarcodeScan = async (req, res) => {
  try {
    const { barcodeValue, batchKey, station, trimmedBarcode, position, row, rowPage } = req.body;

    // Validate required fields
    if (!barcodeValue || !trimmedBarcode || !position) {
      return res.status(400).json({ error: "Missing required fields: barcodeValue, trimmedBarcode, position" });
    }

    // Determine column based on position
    const columnName = position === 'R' ? 'FSB RH' : position === 'L' ? 'FSB LH' : null;
    
    if (!columnName) {
      return res.status(400).json({ error: "Invalid position. Must be 'R' or 'L'" });
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

    // Look for existing QR code record where last 4 characters of value match trimmedBarcode
    const existingRecords = await db('kanban_set')
      .where('batchID', batchID)
      .where('columnName', columnName)
      .select('*');
    
    // Find matching record by comparing last 4 characters
    let matchedRecord = null;
    for (const record of existingRecords) {
      if (record.value && record.value.slice(-4) === trimmedBarcode) {
        matchedRecord = record;
        break;
      }
    }

    if (matchedRecord) {
      // Update existing record with barcode value
      await db('kanban_set')
        .where('id', matchedRecord.id)
        .update({ 
          barcode: barcodeValue,
          updated_at: new Date()
        });

      console.log("Barcode updated for existing QR code:", {
        id: matchedRecord.id,
        columnName,
        row: matchedRecord.row,
        qrValue: matchedRecord.value,
        barcodeValue,
        batchID
      });

      res.status(200).json({ 
        status: "updated",
        id: matchedRecord.id,
        message: "Barcode updated for existing QR code",
        matchedRow: matchedRecord.row
      });
    } else {
      // Create new record with barcode value but blank QR value
      const [insertId] = await db('kanban_set').insert({
        columnName: columnName,
        row: row || null,
        batchID: batchID || null,
        rowPage: rowPage || null,
        value: null, // Leave QR value blank
        barcode: barcodeValue,
        station: station || 2
      });

      console.log("New barcode record created (no matching QR):", {
        id: insertId,
        columnName,
        row,
        rowPage,
        barcodeValue,
        batchID,
        station
      });

      res.status(201).json({ 
        status: "created",
        id: insertId,
        message: "New barcode record created without matching QR code"
      });
    }
  } catch (error) {
    console.error("Error saving barcode scan:", error);
    res.status(500).json({ error: "Failed to save barcode scan data", details: error.message });
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
  saveBarcodeScan,
  getAllKanbanPrints,
  getKanbanPrintsuserID,
  createKanbanPrint,
  updateKanbanPrint,
  getKabanHistory,
  saveKabanHistory,
  getKabanHistoryDate
};
