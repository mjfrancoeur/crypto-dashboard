class Currency {
  constructor({currencyName, currencyID}) {
    this.currencyName = currencyName;
    this.currencyID = currencyID;
  }

  // Static Method: Find By Currency Name
  // ------------------------------------ 
  // Takes a currency name ("BTC", "ETH", etc)
  // as an argument and returns a promise that
  // resolves with the currency ID 
  static findCurrencyIDByCurrencyName(currencyName) {
    return new Promise((resolve, reject) => {
    db.select('currency_id').from('currencies').where({ currency_name: currencyName }).first()
      .then((data) => {
        let currencyID = data.currency_id;
        resolve(currencyID);
      })
      .catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Currency;
