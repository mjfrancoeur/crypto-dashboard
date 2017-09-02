
exports.up = function(knex, Promise) {
  return knex.schema.createTable('subscriptions', (t) => {
    t.increments();
    t.string('user_email').notNullable().index();
    t.json('subscribed_currencies');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('subscriptions');
};
