
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {user_id: 1, first_name: 'Michael', last_name: 'Francoeur', email: 'michael@michael.com', password_digest: '$2a$10$kEI3W4oKZQPYkHU2IzXGoeILz8Hxv.n/hwe064EXs2OxKPeyMUJPS'},
        {user_id: 2, first_name: 'Joe', last_name: 'Smith', email: 'joe@joe.com', password_digest: '$2a$10$5h3zJwBa9oRfMzBoafuZHuhtDk1UgdPmiW4hTYZ9EE4msuoDSoz7W' },
      ]);
    });
};
