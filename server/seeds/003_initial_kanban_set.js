exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('kanban_set').del();

  // Inserts seed entries
  await knex('kanban_set').insert([
    // Batch 1 - Row 1
    {
      columnName: 'FSC LH',
      row: 1,
      batchID: 1,
      rowPage: 1,
      value: 'FSC LH KBA1'
    },
    {
      columnName: 'FSC RH',
      row: 1,
      batchID: 1,
      rowPage: 1,
      value: 'FSC RH KBA1'
    },
    {
      columnName: 'FSB LH',
      row: 1,
      batchID: 1,
      rowPage: 1,
      value: 'FSB LH KBA1'
    },
    {
      columnName: 'FSB RH',
      row: 1,
      batchID: 1,
      rowPage: 1,
      value: 'FSB RH KBA1'
    },
    // Batch 1 - Row 2
    {
      columnName: 'FSC LH',
      row: 2,
      batchID: 1,
      rowPage: 1,
      value: 'FSC LH KBA2'
    },
    {
      columnName: 'FSC RH',
      row: 2,
      batchID: 1,
      rowPage: 1,
      value: 'FSC RH KBA2'
    },
    {
      columnName: 'FSB LH',
      row: 2,
      batchID: 1,
      rowPage: 1,
      value: 'FSB LH KBA2'
    },
    {
      columnName: 'FSB RH',
      row: 2,
      batchID: 1,
      rowPage: 1,
      value: 'FSB RH KBA2'
    },
    // Batch 1 - Row 3
    {
      columnName: 'FSC LH',
      row: 3,
      batchID: 1,
      rowPage: 1,
      value: 'FSC LH KBA3'
    },
    {
      columnName: 'FSC RH',
      row: 3,
      batchID: 1,
      rowPage: 1,
      value: 'FSC RH KBA3'
    },
    {
      columnName: 'FSB LH',
      row: 3,
      batchID: 1,
      rowPage: 1,
      value: 'FSB LH KBA3'
    },
    {
      columnName: 'FSB RH',
      row: 3,
      batchID: 1,
      rowPage: 1,
      value: 'FSB RH KBA3'
    },
    // Batch 1 - Row 4
    {
      columnName: 'FSC LH',
      row: 4,
      batchID: 1,
      rowPage: 1,
      value: 'FSC LH KBA4'
    },
    {
      columnName: 'FSC RH',
      row: 4,
      batchID: 1,
      rowPage: 1,
      value: 'FSC RH KBA4'
    },
    {
      columnName: 'FSB LH',
      row: 4,
      batchID: 1,
      rowPage: 1,
      value: 'FSB LH KBA4'
    },
    {
      columnName: 'FSB RH',
      row: 4,
      batchID: 1,
      rowPage: 1,
      value: 'FSB RH KBA4'
    },
    // Batch 1 - Row 5
    {
      columnName: 'FSC LH',
      row: 5,
      batchID: 1,
      rowPage: 1,
      value: 'FSC LH KBA5'
    },
    {
      columnName: 'FSC RH',
      row: 5,
      batchID: 1,
      rowPage: 1,
      value: 'FSC RH KBA5'
    },
    {
      columnName: 'FSB LH',
      row: 5,
      batchID: 1,
      rowPage: 1,
      value: 'FSB LH KBA5'
    },
    {
      columnName: 'FSB RH',
      row: 5,
      batchID: 1,
      rowPage: 1,
      value: 'FSB RH KBA5'
    },
    // Batch 2 - Row 1
    {
      columnName: 'FSC LH',
      row: 1,
      batchID: 2,
      rowPage: 1,
      value: 'FSC LH KBB1'
    },
    {
      columnName: 'FSC RH',
      row: 1,
      batchID: 2,
      rowPage: 1,
      value: 'FSC RH KBB1'
    },
    {
      columnName: 'FSB LH',
      row: 1,
      batchID: 2,
      rowPage: 1,
      value: 'FSB LH KBB1'
    },
    {
      columnName: 'FSB RH',
      row: 1,
      batchID: 2,
      rowPage: 1,
      value: 'FSB RH KBB1'
    },
    // Batch 3 - Row 1
    {
      columnName: 'FSC LH',
      row: 1,
      batchID: 3,
      rowPage: 1,
      value: 'FSC LH KBC1'
    },
    {
      columnName: 'FSC RH',
      row: 1,
      batchID: 3,
      rowPage: 1,
      value: 'FSC RH KBC1'
    },
    {
      columnName: 'FSB LH',
      row: 1,
      batchID: 3,
      rowPage: 1,
      value: 'FSB LH KBC1'
    },
    {
      columnName: 'FSB RH',
      row: 1,
      batchID: 3,
      rowPage: 1,
      value: 'FSB RH KBC1'
    },
    // Batch 4 - Row 1
    {
      columnName: 'FSC LH',
      row: 1,
      batchID: 1,
      rowPage: 1,
      value: 'FSC LH KBD1'
    },
    {
      columnName: 'FSC RH',
      row: 1,
      batchID: 1,
      rowPage: 1,
      value: 'FSC RH KBD1'
    },
    {
      columnName: 'FSB LH',
      row: 1,
      batchID: 1,
      rowPage: 1,
      value: 'FSB LH KBD1'
    },
    {
      columnName: 'FSB RH',
      row: 1,
      batchID: 1,
      rowPage: 1,
      value: 'FSB RH KBD1'
    },
    // Batch 4 - Row 2
    {
      columnName: 'FSC LH',
      row: 2,
      batchID: 1,
      rowPage: 1,
      value: 'FSC LH KBD2'
    },
    {
      columnName: 'FSC RH',
      row: 2,
      batchID: 1,
      rowPage: 1,
      value: 'FSC RH KBD2'
    },
    {
      columnName: 'FSB LH',
      row: 2,
      batchID: 1,
      rowPage: 1,
      value: 'FSB LH KBD2'
    },
    {
      columnName: 'FSB RH',
      row: 2,
      batchID: 1,
      rowPage: 1,
      value: 'FSB RH KBD2'
    },
    // Batch 4 - Row 3
    {
      columnName: 'FSC LH',
      row: 3,
      batchID: 1,
      rowPage: 1,
      value: 'FSC LH KBD3'
    },
    {
      columnName: 'FSC RH',
      row: 3,
      batchID: 1,
      rowPage: 1,
      value: 'FSC RH KBD3'
    },
    {
      columnName: 'FSB LH',
      row: 3,
      batchID: 1,
      rowPage: 1,
      value: 'FSB LH KBD3'
    },
    {
      columnName: 'FSB RH',
      row: 3,
      batchID: 1,
      rowPage: 1,
      value: 'FSB RH KBD3'
    },
    // Batch 5 - Row 1
    {
      columnName: 'FSC LH',
      row: 1,
      batchID: 1,
      rowPage: 1,
      value: 'FSC LH KBE1'
    },
    {
      columnName: 'FSC RH',
      row: 1,
      batchID: 1,
      rowPage: 1,
      value: 'FSC RH KBE1'
    },
    {
      columnName: 'FSB LH',
      row: 1,
      batchID: 1,
      rowPage: 1,
      value: 'FSB LH KBE1'
    },
    {
      columnName: 'FSB RH',
      row: 1,
      batchID: 1,
      rowPage: 1,
      value: 'FSB RH KBE1'
    },
    // Batch 5 - Row 2
    {
      columnName: 'FSC LH',
      row: 2,
      batchID: 1,
      rowPage: 1,
      value: 'FSC LH KBE2'
    },
    {
      columnName: 'FSC RH',
      row: 2,
      batchID: 1,
      rowPage: 1,
      value: 'FSC RH KBE2'
    },
    {
      columnName: 'FSB LH',
      row: 2,
      batchID: 1,
      rowPage: 1,
      value: 'FSB LH KBE2'
    },
    {
      columnName: 'FSB RH',
      row: 2,
      batchID: 1,
      rowPage: 1,
      value: 'FSB RH KBE2'
    },
    // Batch 5 - Row 3
    {
      columnName: 'FSC LH',
      row: 3,
      batchID: 1,
      rowPage: 1,
      value: 'FSC LH KBE3'
    },
    {
      columnName: 'FSC RH',
      row: 3,
      batchID: 1,
      rowPage: 1,
      value: 'FSC RH KBE3'
    },
    {
      columnName: 'FSB LH',
      row: 3,
      batchID: 1,
      rowPage: 1,
      value: 'FSB LH KBE3'
    },
    {
      columnName: 'FSB RH',
      row: 3,
      batchID: 1,
      rowPage: 1,
      value: 'FSB RH KBE3'
    }
  ]);
};
