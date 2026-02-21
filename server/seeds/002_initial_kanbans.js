exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('kanban_set').del();
  await knex('kanbans').del();

  // Inserts seed entries
  const extraCount = 40;
  const extraKanbans = [];
  for (let i = 1; i <= extraCount; i += 1) {
    const station = String((i % 2) + 1);
    const dataSet = String(4 + (i % 5));
    extraKanbans.push({
      name: `Batch ${String(i).padStart(3, '0')}`,
      data_set: dataSet,
      station
    });
  }

  await knex('kanbans').insert(extraKanbans);
};
