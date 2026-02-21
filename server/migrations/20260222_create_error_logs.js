exports.up = function (knex) {
  return knex.schema.createTable("error_logs", (table) => {
    table.increments("id").primary();
    table.string("route", 255).nullable();
    table.text("error").nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("error_logs");
};
