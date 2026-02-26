exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("username", 255).notNullable().unique();
    table.string("password", 255).notNullable();
    table.boolean("isAdmin").notNullable().defaultTo(false);
    table.string("data_set", 255).defaultTo("40");
    table.string("station", 255);
    table.string("model", 255);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("users");
};
