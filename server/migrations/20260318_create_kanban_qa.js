exports.up = function (knex) {
  return knex.schema.createTable('Kanban_QA', function (table) {
    table.increments('id').primary();
    table.string('kanban').notNullable();
    table.string('qr_kanban').nullable();
    table.string('barcode').nullable();
    table.string('status').notNullable();
    table.string('isValidatedQR').nullable();
    table.string('isValidatedBarcode').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('Kanban_QA');
};
