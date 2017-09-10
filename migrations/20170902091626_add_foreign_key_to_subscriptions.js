
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('subscriptions', (t) => {
    t.foreign('user_identification').references('users.user_id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('subscriptions', (t) => {
    t.dropForeign('user_identification');
  });
};
