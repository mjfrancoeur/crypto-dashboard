const rp = require('request-promise');

// Set number of currencies to request
// ranked in descending order by market cap
const limit = 50;
function makeRequest() {
  return new Promise((resolve, reject) => {
    rp('https://api.coinmarketcap.com/v1/ticker/?limit=50')
      .then((apiData) => {
        resolve(formatData(apiData));
      })
      .catch(() => {
        reject(new Error('API call failed.'));
      });
  });
}

// Format currency data
function formatData(data) {

  let parsedData = JSON.parse(data);
  
  parsedData.forEach((currency) => {
      currency.market_cap_usd = formatNumsAsCurrency(currency.market_cap_usd, 'USD');
      currency.price_usd = formatNumsAsCurrency(currency.price_usd, 'USD');
      currency.available_supply = formatNumsAsCurrency(currency.available_supply, currency.symbol);
  });

  return parsedData;
}

// Function: Format Numbers As Currency
// ------------------------------------
// Takes in a number in string format and the currency type
// Returns a string with the currency symbol appended or pre-pended
// and commas 
function formatNumsAsCurrency(numString, currSymbol) {
  let numWithCommas = addNumberCommas(numString);
  if (currSymbol === 'USD') {
    numWithCommas = `$${numWithCommas}`;
  } else {
    numWithCommas += ` ${currSymbol}`;
  }

  return numWithCommas;
}

// Function: Add Number Commas
// ---------------------------
// Uses regex to add in commas to number string
function addNumberCommas(numString) {
  // Split to avoid unwanted commas after decimal point
  let numStrings = numString.split('.');
  numStrings[0] = numStrings[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (numStrings[1] === '0') {
    return numStrings[0];
  } else {
    return numStrings.join('.');
  }

}

module.exports = makeRequest;
