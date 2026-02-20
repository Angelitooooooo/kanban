exports.up = function (knex) {
  return knex.schema.createTable("kanbans", (table) => {
    table.increments("id").primary();
    table.string("name", 255).notNullable();
    table.string("data_set", 255);
    table.string("station", 255);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("kanbans");
};
