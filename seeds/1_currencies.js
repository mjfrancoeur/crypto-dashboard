const rows = require('../services/currencyRows');

exports.seed = function(knex, Promise) {

  // Deletes ALL existing entries
  return knex('currencies').del()
    .then(function () {
      // Inserts seed entries
      return knex('currencies').insert(rows);
    });
};
