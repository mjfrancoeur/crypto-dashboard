
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('subscriptions', (t) => {
    t.foreign('user_email').references('users.email');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('subscriptions', (t) => {
    t.dropForeign('user_email');
  });
};
