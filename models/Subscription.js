class Subscription {
  constructor({ userID, currencyID }) {
    this.userID = userID;
    this.currencyID = currencyID;
  }

  // Static Method: Find By UserID
  // -----------------------------
  // Takes in a string (userID) and returns a promise that 
  // resolves with an array of any currency subscriptions that user has in the database
  // or rejects with an error.
  static findByUserID(userID) {
    return new Promise((resolve, reject) => {
      db.select('currencies.currency_name').from('users').where({ user_id: userID }).join('subscriptions', 'users.id', 'subscriptions.user_id')
        .join('currencies', 'subscriptions.currency_id', 'currencies.currency_id')
          .then((currencies) => {
              if (currencies.length === 0) {
                resolve([]);
              } else {
                let arrCurrencies = currencies.map((currencyObj) => {
                  return currencyObj['currency_name'];
                });
                resolve(arrCurrencies);
              }
          })
          .catch((error) => {
            console.log('Failed at findByUserID method call');
            reject(error);
          });
    });
  }

  // Method: Save
  // -----------------------------------------------
  // Returns a promise that resolves with successful
  // insert into the subscriptions table
  save() {
    return new Promise((resolve, reject) => {
      // Get currency ID
      db('subscriptions').insert({ user_id: this.userID, currency_id: this.currencyID })
        .then(() => {
          resolve();
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  }

  // Method: Delete
  // --------------
  // Returns a promise that resolves when subscription currency
  // is removed from a user's set of subscriptions. Rejects w/ an error.
  delete() {
    return new Promise((resolve, reject) => {
      db('subscriptions')
        .where({ user_id: this.userID, currency_id: this.currencyID })
        .del()
          .then(() => {
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      });
  }

}

module.exports = Subscription;
