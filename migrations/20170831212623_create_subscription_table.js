
exports.up = function(knex, Promise) {
  return knex.schema.createTable('subscriptions', (t) => {
    t.increments();
    t.string('user_email').notNullable().index();
    t.integer('currency_id').index();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('subscriptions');
};
