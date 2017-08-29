const knex = require('./db');

const express = require('express');

const app = express();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log('This server is listening to Fresh Air on WNYC port', PORT);
});
