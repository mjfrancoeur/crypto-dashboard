const rp = require('request-promise');

// Set number of currencies to request
// ranked in descending order by market cap
const limit = 50;
function makeRequest() {
  return new Promise((resolve, reject) => {
    rp('https://api.coinmarketcap.com/v1/ticker/?limit=50')
      .then((apiData) => {
        resolve(JSON.parse(apiData));
      })
      .catch(() => {
        reject(new Error('API call failed.'));
      });
  });
}

module.exports = makeRequest;
