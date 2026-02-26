exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('kanbans').del();

  // Inserts seed entries
  await knex('kanbans').insert([
    {
      name: 'KBB1',
      data_set: '40',
      station: '2'
    },
  ]);
};
