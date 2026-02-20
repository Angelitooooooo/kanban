exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Inserts seed entries
  await knex('users').insert([
    {
      username: 'admin',
      password: 'admin123',
      isAdmin: true,
    },
    {
      username: 'user1',
      password: 'user123',
      isAdmin: false,
      station : 1
    },
    {
      username: 'user2',
      password: 'user123',
      isAdmin: false,
      station : 2
    }
  ]);
};
