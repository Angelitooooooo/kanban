exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Inserts seed entries
  await knex('users').insert([
    {
      username: 'admin',
      password: 'admin123',
      isAdmin: true,
      station : null,
      model : '036J'
    },
    {
      username: 'user1',
      password: 'user123',
      isAdmin: false,
      station : 1,
      model : '036J'
    },
    {
      username: 'user3',
      password: 'user123',
      isAdmin: false,
      station : 3,
      model : '036J'
    },
    {
      username: 'user2',
      password: 'user123',
      isAdmin: false,
      station : 2,
      model : '036J'
    }
  ]);
};
