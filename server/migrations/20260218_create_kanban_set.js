exports.up = function (knex) {
  return knex.schema.createTable("kanban_set", (table) => {
    table.increments("id").primary();
    table.string("columnName", 255);
    table.integer("row");
    table.integer("batchID").unsigned().references("id").inTable("kanbans").onDelete("CASCADE");
    table.integer("rowPage");
    table.text("value");
    table.string("station", 255);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("kanban_set");
};
