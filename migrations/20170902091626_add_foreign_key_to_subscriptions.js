
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('subscriptions', (t) => {
    t.foreign('user_id').references('users.id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('subscriptions', (t) => {
    t.dropForeign('user_id');
  });
};
