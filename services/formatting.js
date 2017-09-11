// Goal of this file is to update the data in the currencies table.
// Do not use this file. It is a WORK IN PROGRESS.

const request = require('request-promise');

// Function: Format
// ----------------
// Takes in a JSON string
// and returns in proper format to seed currencies table
function format(json) {
  let parsed = JSON.parse(json);

  let symbols = parsed.map((currency) => {
    return { currency_name: currency.symbol };
  });

  return symbols;
}

module.exports = request('https://api.coinmarketcap.com/v1/ticker/')
  .then((data) => {
    return format(data);
  })
  .catch((err) => {
    console.log(err);
    return err;
  });
