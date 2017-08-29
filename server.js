const knex = require('./db'),
      express = require('express'),
      app = express();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log('This server is listening to Fresh Air on WNYC port', PORT);
});
