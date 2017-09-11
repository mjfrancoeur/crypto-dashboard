
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('subscriptions', (t) => {
    t.foreign('currency_id').references('currencies.currency_id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('subscriptions', (t) => {
    t.dropForeign('currency_id');
  });
};
