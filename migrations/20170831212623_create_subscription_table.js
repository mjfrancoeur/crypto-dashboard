
exports.up = function(knex, Promise) {
  return knex.schema.createTable('subscriptions', (t) => {
    t.increments();
    t.integer('user_id').notNullable().index();
    t.integer('currency_id').index();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('subscriptions');
};
