exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('kanban_set').del();
  await knex('kanbans').del();

  // Inserts seed entries
  const baseKanbans = [
    {
      name: 'Project Alpha',
      data_set: '5',
      station: '1'
    },
    {
      name: 'Project Beta',
      data_set: '6',
      station: '2'
    },
    {
      name: 'Project Gamma',
      data_set: '7',
      station: '1'
    },
    {
      name: 'Project Delta',
      data_set: '5',
      station: '2'
    },
    {
      name: 'Project Epsilon',
      data_set: '6',
      station: '1'
    },
    {
      name: 'Project Zeta',
      data_set: '4',
      station: '2'
    },
    {
      name: 'Project Eta',
      data_set: '5',
      station: '1'
    },
    {
      name: 'Project Theta',
      data_set: '7',
      station: '2'
    }
  ];

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

  await knex('kanbans').insert([...baseKanbans, ...extraKanbans]);
};
