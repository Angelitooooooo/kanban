exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('kanban_print').del();

  // Inserts seed entries
  await knex('kanban_print').insert([
    {
      kanban: 'FSB LH KBJ2',
      printCopies: 25,
      user_id: 11
    },
    {
      kanban: 'RR Cushion KGH6',
      printCopies: 15,
      user_id: 11
    },
    {
      kanban: 'FSB LH KBJ2',
      printCopies: 30,
      user_id: 12
    },
    {
      kanban: 'RR Cushion KGH6',
      printCopies: 20,
      user_id: 12
    }
  ]);
};
