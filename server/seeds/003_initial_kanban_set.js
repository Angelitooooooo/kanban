exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('kanban_set').del();

  // Inserts seed entries
  await knex('kanban_set').insert([
    // Batch 1 (Station 1) - Row 1
    {
      columnName: 'FSC LH',
      row: 1,
      batchID: 1,
      rowPage: 1,
      value: 'FSC LH KBA1',
      station: '1'
    },
    {
      columnName: 'FSC RH',
      row: 1,
      batchID: 1,
      rowPage: 1,
      value: 'FSC RH KBA1',
      station: '1'
    },
    {
      columnName: 'FSB LH',
      row: 1,
      batchID: 1,
      rowPage: 1,
      value: 'FSB LH KBA1',
      station: '1'
    },
    {
      columnName: 'FSB RH',
      row: 1,
      batchID: 1,
      rowPage: 1,
      value: 'FSB RH KBA1',
      station: '1'
    },
    // Batch 1 (Station 1) - Row 2
    {
      columnName: 'FSC LH',
      row: 2,
      batchID: 1,
      rowPage: 1,
      value: 'FSC LH KBA2',
      station: '1'
    },
    {
      columnName: 'FSC RH',
      row: 2,
      batchID: 1,
      rowPage: 1,
      value: 'FSC RH KBA2',
      station: '1'
    },
    {
      columnName: 'FSB LH',
      row: 2,
      batchID: 1,
      rowPage: 1,
      value: 'FSB LH KBA2',
      station: '1'
    },
    {
      columnName: 'FSB RH',
      row: 2,
      batchID: 1,
      rowPage: 1,
      value: 'FSB RH KBA2',
      station: '1'
    },
    // Batch 1 (Station 1) - Row 3
    {
      columnName: 'FSC LH',
      row: 3,
      batchID: 1,
      rowPage: 1,
      value: 'FSC LH KBA3',
      station: '1'
    },
    {
      columnName: 'FSC RH',
      row: 3,
      batchID: 1,
      rowPage: 1,
      value: 'FSC RH KBA3',
      station: '1'
    },
    {
      columnName: 'FSB LH',
      row: 3,
      batchID: 1,
      rowPage: 1,
      value: 'FSB LH KBA3',
      station: '1'
    },
    {
      columnName: 'FSB RH',
      row: 3,
      batchID: 1,
      rowPage: 1,
      value: 'FSB RH KBA3',
      station: '1'
    },
    // Batch 1 (Station 1) - Row 4
    {
      columnName: 'FSC LH',
      row: 4,
      batchID: 1,
      rowPage: 1,
      value: 'FSC LH KBA4',
      station: '1'
    },
    {
      columnName: 'FSC RH',
      row: 4,
      batchID: 1,
      rowPage: 1,
      value: 'FSC RH KBA4',
      station: '1'
    },
    {
      columnName: 'FSB LH',
      row: 4,
      batchID: 1,
      rowPage: 1,
      value: 'FSB LH KBA4',
      station: '1'
    },
    {
      columnName: 'FSB RH',
      row: 4,
      batchID: 1,
      rowPage: 1,
      value: 'FSB RH KBA4',
      station: '1'
    },
    // Batch 1 (Station 1) - Row 5
    {
      columnName: 'FSC LH',
      row: 5,
      batchID: 1,
      rowPage: 1,
      value: 'FSC LH KBA5',
      station: '1'
    },
    {
      columnName: 'FSC RH',
      row: 5,
      batchID: 1,
      rowPage: 1,
      value: 'FSC RH KBA5',
      station: '1'
    },
    {
      columnName: 'FSB LH',
      row: 5,
      batchID: 1,
      rowPage: 1,
      value: 'FSB LH KBA5',
      station: '1'
    },
    {
      columnName: 'FSB RH',
      row: 5,
      batchID: 1,
      rowPage: 1,
      value: 'FSB RH KBA5',
      station: '1'
    },
    // Batch 2 (Station 2) - Row 1
    {
      columnName: 'FSC LH',
      row: 1,
      batchID: 2,
      rowPage: 1,
      value: 'FSC LH KBB1',
      station: '2'
    },
    {
      columnName: 'FSC RH',
      row: 1,
      batchID: 2,
      rowPage: 1,
      value: 'FSC RH KBB1',
      station: '2'
    },
    {
      columnName: 'FSB LH',
      row: 1,
      batchID: 2,
      rowPage: 1,
      value: 'FSB LH KBB1',
      station: '2'
    },
    {
      columnName: 'FSB RH',
      row: 1,
      batchID: 2,
      rowPage: 1,
      value: 'FSB RH KBB1',
      station: '2'
    },
    // Batch 3 (Station 1) - Row 1
    {
      columnName: 'FSC LH',
      row: 1,
      batchID: 3,
      rowPage: 1,
      value: 'FSC LH KBC1',
      station: '1'
    },
    {
      columnName: 'FSC RH',
      row: 1,
      batchID: 3,
      rowPage: 1,
      value: 'FSC RH KBC1',
      station: '1'
    },
    {
      columnName: 'FSB LH',
      row: 1,
      batchID: 3,
      rowPage: 1,
      value: 'FSB LH KBC1',
      station: '1'
    },
    {
      columnName: 'FSB RH',
      row: 1,
      batchID: 3,
      rowPage: 1,
      value: 'FSB RH KBC1',
      station: '1'
    },
    // Batch 4 (Station 2) - Row 1
    {
      columnName: 'FSC LH',
      row: 1,
      batchID: 4,
      rowPage: 1,
      value: 'FSC LH KBD1',
      station: '2'
    },
    {
      columnName: 'FSC RH',
      row: 1,
      batchID: 4,
      rowPage: 1,
      value: 'FSC RH KBD1',
      station: '2'
    },
    {
      columnName: 'FSB LH',
      row: 1,
      batchID: 4,
      rowPage: 1,
      value: 'FSB LH KBD1',
      station: '2'
    },
    {
      columnName: 'FSB RH',
      row: 1,
      batchID: 4,
      rowPage: 1,
      value: 'FSB RH KBD1',
      station: '2'
    },
    // Batch 4 (Station 2) - Row 2
    {
      columnName: 'FSC LH',
      row: 2,
      batchID: 4,
      rowPage: 1,
      value: 'FSC LH KBD2',
      station: '2'
    },
    {
      columnName: 'FSC RH',
      row: 2,
      batchID: 4,
      rowPage: 1,
      value: 'FSC RH KBD2',
      station: '2'
    },
    {
      columnName: 'FSB LH',
      row: 2,
      batchID: 4,
      rowPage: 1,
      value: 'FSB LH KBD2',
      station: '2'
    },
    {
      columnName: 'FSB RH',
      row: 2,
      batchID: 4,
      rowPage: 1,
      value: 'FSB RH KBD2',
      station: '2'
    },
    // Batch 4 (Station 2) - Row 3
    {
      columnName: 'FSC LH',
      row: 3,
      batchID: 4,
      rowPage: 1,
      value: 'FSC LH KBD3',
      station: '2'
    },
    {
      columnName: 'FSC RH',
      row: 3,
      batchID: 4,
      rowPage: 1,
      value: 'FSC RH KBD3',
      station: '2'
    },
    {
      columnName: 'FSB LH',
      row: 3,
      batchID: 4,
      rowPage: 1,
      value: 'FSB LH KBD3',
      station: '2'
    },
    {
      columnName: 'FSB RH',
      row: 3,
      batchID: 4,
      rowPage: 1,
      value: 'FSB RH KBD3',
      station: '2'
    },
    // Batch 5 (Station 1) - Row 1
    {
      columnName: 'FSC LH',
      row: 1,
      batchID: 5,
      rowPage: 1,
      value: 'FSC LH KBE1',
      station: '1'
    },
    {
      columnName: 'FSC RH',
      row: 1,
      batchID: 5,
      rowPage: 1,
      value: 'FSC RH KBE1',
      station: '1'
    },
    {
      columnName: 'FSB LH',
      row: 1,
      batchID: 5,
      rowPage: 1,
      value: 'FSB LH KBE1',
      station: '1'
    },
    {
      columnName: 'FSB RH',
      row: 1,
      batchID: 5,
      rowPage: 1,
      value: 'FSB RH KBE1',
      station: '1'
    },
    // Batch 5 (Station 1) - Row 2
    {
      columnName: 'FSC LH',
      row: 2,
      batchID: 5,
      rowPage: 1,
      value: 'FSC LH KBE2',
      station: '1'
    },
    {
      columnName: 'FSC RH',
      row: 2,
      batchID: 5,
      rowPage: 1,
      value: 'FSC RH KBE2',
      station: '1'
    },
    {
      columnName: 'FSB LH',
      row: 2,
      batchID: 5,
      rowPage: 1,
      value: 'FSB LH KBE2',
      station: '1'
    },
    {
      columnName: 'FSB RH',
      row: 2,
      batchID: 5,
      rowPage: 1,
      value: 'FSB RH KBE2',
      station: '1'
    },
    // Batch 5 (Station 1) - Row 3
    {
      columnName: 'FSC LH',
      row: 3,
      batchID: 5,
      rowPage: 1,
      value: 'FSC LH KBE3',
      station: '1'
    },
    {
      columnName: 'FSC RH',
      row: 3,
      batchID: 5,
      rowPage: 1,
      value: 'FSC RH KBE3',
      station: '1'
    },
    {
      columnName: 'FSB LH',
      row: 3,
      batchID: 5,
      rowPage: 1,
      value: 'FSB LH KBE3',
      station: '1'
    },
    {
      columnName: 'FSB RH',
      row: 3,
      batchID: 5,
      rowPage: 1,
      value: 'FSB RH KBE3',
      station: '1'
    },
    // Batch 6 (Station 2) - Row 1
    {
      columnName: 'FSC LH',
      row: 1,
      batchID: 6,
      rowPage: 1,
      value: 'FSC LH KBF1',
      station: '2'
    },
    {
      columnName: 'FSC RH',
      row: 1,
      batchID: 6,
      rowPage: 1,
      value: 'FSC RH KBF1',
      station: '2'
    },
    {
      columnName: 'FSB LH',
      row: 1,
      batchID: 6,
      rowPage: 1,
      value: 'FSB LH KBF1',
      station: '2'
    },
    {
      columnName: 'FSB RH',
      row: 1,
      batchID: 6,
      rowPage: 1,
      value: 'FSB RH KBF1',
      station: '2'
    },
    // Batch 7 (Station 1) - Row 1
    {
      columnName: 'FSC LH',
      row: 1,
      batchID: 7,
      rowPage: 1,
      value: 'FSC LH KBG1',
      station: '1'
    },
    {
      columnName: 'FSC RH',
      row: 1,
      batchID: 7,
      rowPage: 1,
      value: 'FSC RH KBG1',
      station: '1'
    },
    {
      columnName: 'FSB LH',
      row: 1,
      batchID: 7,
      rowPage: 1,
      value: 'FSB LH KBG1',
      station: '1'
    },
    {
      columnName: 'FSB RH',
      row: 1,
      batchID: 7,
      rowPage: 1,
      value: 'FSB RH KBG1',
      station: '1'
    },
    // Batch 8 (Station 2) - Row 1
    {
      columnName: 'FSC LH',
      row: 1,
      batchID: 8,
      rowPage: 1,
      value: 'FSC LH KBH1',
      station: '2'
    },
    {
      columnName: 'FSC RH',
      row: 1,
      batchID: 8,
      rowPage: 1,
      value: 'FSC RH KBH1',
      station: '2'
    },
    {
      columnName: 'FSB LH',
      row: 1,
      batchID: 8,
      rowPage: 1,
      value: 'FSB LH KBH1',
      station: '2'
    },
    {
      columnName: 'FSB RH',
      row: 1,
      batchID: 8,
      rowPage: 1,
      value: 'FSB RH KBH1',
      station: '2'
    }
  ]);
};
