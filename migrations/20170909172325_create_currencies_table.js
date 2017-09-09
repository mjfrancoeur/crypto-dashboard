
exports.up = function(knex, Promise) {
  return knex.schema.createTable('currencies', (t) => {
    t.increments('currency_id');
    t.string('currency_name');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('currencies');
};
