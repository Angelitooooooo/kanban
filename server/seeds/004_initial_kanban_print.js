exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('kanban_print').del();

  // Inserts seed entries - Complete set for KBB1
  await knex('kanban_print').insert([
    {
      kanban: 'FSB RH KBB1',
      printCopies: 25,
      user_id: 2
    },
    {
      kanban: 'FSB LH KBB1',
      printCopies: 25,
      user_id: 2
    },
    {
      kanban: 'FSC RH KBB1',
      printCopies: 25,
      user_id: 2
    },
    {
      kanban: 'FSC LH KBB1',
      printCopies: 25,
      user_id: 2
    },
    {
      kanban: 'RSB RH KBB1',
      printCopies: 25,
      user_id: 2
    },
    {
      kanban: 'RSB LH KBB1',
      printCopies: 25,
      user_id: 2
    },
    {
      kanban: 'RR Cushion KBB1',
      printCopies: 25,
      user_id: 2
    },
  ]);
};
