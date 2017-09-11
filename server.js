// Require statements and constants
const knex = require('./db'); // TODO: rename to DB

const express = require('express');

const cookieSession = require('cookie-session');

const bodyParser = require('body-parser');

const bcrypt = require('bcrypt-as-promised');

const makeRequest = require('./services/makeRequest');

const PORT = process.env.PORT || 8000;

if (process.env.APP_MODE !== 'production') {
  require('dotenv').config();
}

const app = express();

// Set EJS templating
app.set('view engine', 'ejs');

// parse application/x-www-form-urlencoded 
// Adds to req.body
app.use(bodyParser.urlencoded({ extended: false }));

// Cookie session middleware
// Stores session data on the client within a cookie
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SECRET_ONE, process.env.SECRET_TWO,]
}));

app.get('/', (req, res) => {
  makeRequest()
    .then((data) => {
      res.render('home', { data: data, dataError: null, loggedIn: isLoggedIn(req.session.userID) });
    })
    .catch((err) => {
      console.log(err);
      res.render('home', { data: null, dataError: 'Sorry, the dashboard can\'t be loaded at this time.', loggedIn: isLoggedIn(req.session.userID)});
    });
});

// Render ./views/login.ejs
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Verify login credentials
// If valid, redirect to GET /profile
app.post('/login', (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  // Verify login
  // Return array of users that match given email
  knex('users').where({ email: email })
    .then((users) => {
      console.log(users);
      // If query returns no users with given email
      if (users.length === 0) {
        return res.render('login', { error: 'Couldn\'t find a user with that email address.' });
      }
      users.forEach((user) => {
        bcrypt.compare(password, user.password_digest)
          .then(() => {
            // if password is correct
            addSessionID(user, req);
            res.redirect(`/profile/${user.user_id}`);
          })
          .catch((err) => {
            console.log(err);
            res.render('login', { error: 'Incorrect password.' });
          });
      });
    })
    .catch((err) => {
      // If database query fails
      console.log(err);
      res.sendStatus(500);
    });
});

// Render ./views/signup.ejs
app.get('/signup', (req, res) => {
  redirectIfLoggedIn(req, res);
  res.render('signup');
});

// Verify that all necessary info has been input
// Add user entry to user database
// If valid, redirect to GET /profile
app.post('/signup', (req, res) => {
  // Get data from request body
  const password = req.body.password;
  // Hash password with bcrypt
  bcrypt.hash(password, 10)
    .then((pwDigest) => {
      // Attemp to add user info to database
      knex('users').insert({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password_digest: pwDigest,
      }, '*')
        .then((user) => {
          // if table insert completes
          addSessionID(user, req);
          res.redirect(`/profile/${user.user_id}`);
        })
        .catch((dbErr) => {
          // if table insert fails
          console.log('Error adding user to database');
          res.send(dbErr).status(500);
        });
    })
    .catch((hashErr) => {
      // if bcrypt hashing fails
      console.log('Error with bcrypt hashing of password');
      res.send(hashErr).status(500);
    });
});

// Direct user to their profile page
// If user is logged in / authorized
app.get('/profile/:id', (req, res) => {
  makeRequest()
    .then((data) => {
      res.render('profile', { data: data, dataError: null, loggedIn: isLoggedIn(req.session.userID) });
    })
    .catch((err) => {
      console.log(err);
      res.render('profile', { data: null, dataError: 'Sorry, the dashboard can\'t be loaded at this time.', loggedIn: isLoggedIn(req.session.userID)});
    });
});

// Log user out and redirect to homepage
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

// Subscribe a user to currencies
app.post('/currencies', (req, res) => {
  console.log(req.body.subscribe);
  // If user is not logged in
  if (!req.session.userID) {
    res.render('login', { error: 'You need to be signed in to subscribe' });
  }
  // Select user's current subscriptions
  fetchSubscriptions(req.session.userID)
    .then((subscribedCurrencies) => {
      // Add subscriptions requested to an array
      let requestedSubscriptions = [];
      if (req.body.subscribe.length = 1) {
        requestedSubscriptions.push(req.body.subscribe);
      } else {
        requestedSubscriptions = req.body.subscribe;
      }

      // Remove duplicates
      const newSubscriptions = requestedSubscriptions.filter((currency) => {
        return subscribedCurrencies.indexOf(currency) === -1;
      });

      // Insert subscriptions into table
      newSubscriptions.forEach((currencyAbbreviation) => {
        insertSubscription(req.session.userID, currencyAbbreviation);
      });

      // send to profile page, which will populate with new subscriptions
      res.redirect(`/profile/${req.session.userID}`);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(500);
    });
});

// Set server to listen on port PORT
app.listen(PORT, () => {
  console.log('This server is listening to Fresh Air on WNYC port', PORT);
});

// Function: Add Session ID
// ------------------------
// Takes in a user object and a request.
// Adds a userID proprety to req.sessions
function addSessionID(user, req) {
  req.session.userID = user.user_id;
}

// Function: Redirect If Logged In
// -------------------------------
// Redirects user to their profile page if logged in
function redirectIfLoggedIn(req, res) {
  if (req.session.userID) {
    res.redirect(`/profile/${req.session.userID}`);
  }
}

// Function: Fetch Subscriptions
// -----------------------------
// Takes in a string (userID) and returns a promise that 
// resolves with an array of any currency subscriptions that user has in the database
// or rejects with an error.
function fetchSubscriptions(userID) {
  return new Promise((resolve, reject) => {
    knex.select('currencies.currency_name').from('users').where({ user_id: userID }).join('subscriptions', 'users.id', 'subscriptions.user_id')
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
          console.log('THIS IS WHERE we fail');
          reject(error);
        });
  });
}

// Function: Get Currency ID
// -------------------------
// Takes a currency abbreviation ('BTC', 'ETH', etc.) as a string
// Returns a promise that resolves with the currency ID from the currencies
// table in the database.
function getCurrencyID(currency) {
  return new Promise((resolve, reject) => {
  knex.select('currency_id').from('currencies').where({ currency_name: currency }).first()
    .then((data) => {
      let currencyID = data.currency_id;
      console.log('here the first id:',currencyID);
      resolve(currencyID);
    })
    .catch((err) => {
      reject(err);
    });
  });
}

// Function: Is Logged In
// ----------------------
// Accepts the cookie session userID as an arg
// Returns true if there is a session userID, false if the arg is null
function isLoggedIn(sessionID) {
  if (sessionID) {
    return true;
  }
  return false;
}

// Function: Insert Subscriptions
// -----------------------------
// Takes a user ID and a currency abbreviation (string) as arguments
// and inserts into the subscriptions table
function insertSubscription(userID, currencyAbbrev) {
  // Get currency ID
  getCurrencyID(currencyAbbrev)
    .then((currencyID) => {
  console.log('here\'s the id:', currencyID);
  if (currencyID !== -1) {
    knex('subscriptions').insert({ user_id: userID, currency_id: currencyID })
      .then()
      .catch((err) => {
        console.log(err);
        return err;
      });
  } else {
    console.log('Could not find that currency');
    //TODO: throw error
  }
    })
    .catch((err) => {
      return err;
    });
}
