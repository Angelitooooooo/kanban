exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('kanban_set').del();

  // Inserts seed entries
  const columns = ['FSC LH', 'FSC RH', 'FSB LH', 'FSB RH','RSB RH','RSB LH', 'RR Cushion'];
  const rowsPerBatch = 40;
  const rowsPerPage = 10;
  const batches = await knex('kanbans').select('id', 'name', 'station');

  const entries = [];
  for (const batch of batches) {
    const station = String(batch.station || '');
    for (let row = 1; row <= rowsPerBatch; row += 1) {
      const rowPage = Math.floor((row - 1) / rowsPerPage) + 1;
      for (const columnName of columns) {
        entries.push({
          columnName,
          row,
          batchID: batch.id,
          rowPage,
          value: `${columnName} ${batch.name} R${row}`,
          station
        });
      }
    }
  }

  if (entries.length > 0) {
    await knex.batchInsert('kanban_set', entries, 1000);
  }
};
