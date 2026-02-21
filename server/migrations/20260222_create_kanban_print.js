exports.up = function (knex) {
  return knex.schema.createTable("kanban_print", (table) => {
    table.increments("id").primary();
    table.string("kanban", 255).notNullable();
    table.integer("printCopies").notNullable().defaultTo(0);
    table.integer("user_id");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("kanban_print");
};
