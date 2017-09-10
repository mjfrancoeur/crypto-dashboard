
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('subscriptions').del()
    .then(function () {
      // Inserts seed entries
      return knex('subscriptions').insert([
        {id: 1, user_id: 1, currency_id: 1},
        {id: 2, user_id: 1, currency_id: 3},
        {id: 3, user_id: 2, currency_id: 5},
        {id: 4, user_id: 2, currency_id: 7},
      ]);
    });
};
