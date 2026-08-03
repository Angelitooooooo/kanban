// Delete KanbanQA by id
const deleteKanbanQAById = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db('Kanban_qa').where('id', id).first();
    if (!existing) {
      return res.status(404).json({ error: 'KanbanQA record not found.' });
    }
    await db('Kanban_qa').where('id', id).del();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting KanbanQA record:', error);
    res.status(500).json({ error: 'Failed to delete KanbanQA record', details: error.message });
  }
};
// Update all fields of Kanban_qa by id
const updateKanbanQAAllFieldsById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      kanban,
      qr_kanban,
      barcode,
      status,
      isValidatedBarcode,
      isValidatedQR
    } = req.body;

    const existing = await db('Kanban_qa').where('id', id).first();
    if (!existing) {
      return res.status(404).json({ error: 'KanbanQA record not found.' });
    }

    const updateData = {
      updated_at: new Date()
    };
    if (kanban !== undefined) updateData.kanban = kanban;
    if (qr_kanban !== undefined) updateData.qr_kanban = qr_kanban;
    if (barcode !== undefined) updateData.barcode = barcode;
    if (status !== undefined) updateData.status = status;
    if (isValidatedBarcode !== undefined) updateData.isValidatedBarcode = isValidatedBarcode;
    if (isValidatedQR !== undefined) updateData.isValidatedQR = isValidatedQR;

    await db('Kanban_qa').where('id', id).update(updateData);
    const updated = await db('Kanban_qa').where('id', id).first();

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating KanbanQA record:', error);
    res.status(500).json({ error: 'Failed to update KanbanQA record', details: error.message });
  }
};
const { db } = require('../db');

const getKanbanQAByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Query parameter date is required. Use YYYY-MM-DD format.' });
    }

    const results = await db('Kanban_qa')
      .select('*')
      .whereRaw('DATE(created_at) = ?', [date])
      .orderBy('id', 'asc');

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching Kanban_qa by date:', error);
    res.status(500).json({ error: 'Failed to fetch Kanban_qa data', details: error.message });
  }
};

const createKanbanQA = async (req, res) => {
  try {
    const { kanban, status, date } = req.body;
    if (!kanban) {
      return res.status(400).json({ error: 'kanban is required.' });
    }
    if (!status) {
      return res.status(400).json({ error: 'status is required.' });
    }

    const [insertedId] = await db('Kanban_qa').insert({
      kanban,
      qr_kanban: null,
      barcode: null,
      status,
      // created_at: date ? new Date(date) : new Date()
      created_at: date
  ? (() => {
      const d = new Date(date);
      const now = new Date();
      d.setHours(
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
      );
      return d;
    })()
  : new Date()
    });

    const inserted = await db('Kanban_qa').where('id', insertedId).first();

    // const io = req.app.get('io');
    // const socket = req.app.get('socket'); // Assume sender's socket is attached to req.app
    // if (io) {
    //   const payload = {
    //     message: "New kanban print created"
    //   };
    //   if (socket) {
    //     socket.broadcast.emit('refresh-kanban-prints', payload);
    //   } else {
    //     io.emit('refresh-kanban-prints', payload);
    //   }
    // }

    res.status(201).json(inserted);
  } catch (error) {
    console.error('Error creating KanbanQA record:', error);
    res.status(500).json({ error: 'Failed to create KanbanQA record', details: error.message });
  }
};

const updateKanbanQAById = async (req, res) => {
  try {
    const { id } = req.params;
    const { qr_kanban, status } = req.body;

    if (!qr_kanban) {
      return res.status(400).json({ error: 'qr_kanban is required.' });
    }

    const existing = await db('Kanban_qa').where('id', id).first();
    if (!existing) {
      return res.status(404).json({ error: 'KanbanQA record not found.' });
    }

    // Use status from request body if provided, else fallback to logic
    await db('Kanban_qa').where('id', id).update({ qr_kanban, status, updated_at: new Date() });
    const updated = await db('Kanban_qa').where('id', id).first();

    // const io = req.app.get('io');
    // const socket = req.app.get('socket'); // Assume sender's socket is attached to req.app
    // if (io) {
    //   const payload = {
    //     message: "New kanban print created"
    //   };
    //   if (socket) {
    //     socket.broadcast.emit('refresh-kanban-prints', payload);
    //   } else {
    //     io.emit('refresh-kanban-prints', payload);
    //   }
    // }
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating KanbanQA qr_kanban:', error);
    res.status(500).json({ error: 'Failed to update KanbanQA record', details: error.message });
  }
};

const updateBarcodeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { barcode } = req.body;
    if (!barcode) {
      return res.status(400).json({ error: 'barcode is required.' });
    }
    const existing = await db('Kanban_qa').where('id', id).first();
    if (!existing) {
      return res.status(404).json({ error: 'KanbanQA record not found.' });
    }
    // Determine status based on barcode and kanban logic
    let status = existing.status;
    try {
      const kanbanParts = existing.kanban.split(' ');
      const positionKanban = kanbanParts[1] ? kanbanParts[1][0] : '';
      const lastCharBarcode = barcode.slice(-1);
      status = positionKanban === lastCharBarcode ? 'Verified' : 'Barcode does not match';
    } catch (e) {
      status = 'Unverified';
    }
    await db('Kanban_qa').where('id', id).update({ barcode, status, updated_at: new Date() });
    const updated = await db('Kanban_qa').where('id', id).first();

    // const io = req.app.get('io');
    // const socket = req.app.get('socket'); // Assume sender's socket is attached to req.app
    // if (io) {
    //   const payload = {
    //     message: "New kanban print created"
    //   };
    //   if (socket) {
    //     socket.broadcast.emit('refresh-kanban-prints', payload);
    //   } else {
    //     io.emit('refresh-kanban-prints', payload);
    //   }
    // }
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating KanbanQA barcode:', error);
    res.status(500).json({ error: 'Failed to update KanbanQA barcode', details: error.message });
  }
};

module.exports = {
  getKanbanQAByDate,
  createKanbanQA,
  updateKanbanQAById,
  updateBarcodeById,
  updateKanbanQAAllFieldsById,
  deleteKanbanQAById,
};
