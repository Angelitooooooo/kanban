exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('kanban_set').del();
  await knex('kanbans').del();

  // Inserts seed entries
  await knex('kanbans').insert([
    {
      id: 1,
      name: 'Project Alpha',
      data_set: '5',
      station: '1'
    },
    {
      id: 2,
      name: 'Project Beta',
      data_set: '6',
      station: '2'
    },
    {
      id: 3,
      name: 'Project Gamma',
      data_set: '7',
      station: '1'
    },
    {
      id: 4,
      name: 'Project Delta',
      data_set: '5',
      station: '2'
    },
    {
      id: 5,
      name: 'Project Epsilon',
      data_set: '6',
      station: '1'
    },
    {
      id: 6,
      name: 'Project Zeta',
      data_set: '4',
      station: '2'
    },
    {
      id: 7,
      name: 'Project Eta',
      data_set: '5',
      station: '1'
    },
    {
      id: 8,
      name: 'Project Theta',
      data_set: '7',
      station: '2'
    }
  ]);
};
