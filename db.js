const APP_MODE = process.env.APP_MODE || 'development';

const config = require('./knexfile')[APP_MODE];

const knex = require('knex')(config);

module.exports = knex;
