exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('kanban_set').del();
  await knex('kanbans').del();

  // Inserts seed entries
  await knex('kanbans').insert([
    {
      id: 1,
      name: 'Project Alpha',
      data_set: '5'
    },
    {
      id: 2,
      name: 'Project Beta',
      data_set: '6'
    },
    {
      id: 3,
      name: 'Project Gamma',
      data_set: '7'
    }
  ]);
};
