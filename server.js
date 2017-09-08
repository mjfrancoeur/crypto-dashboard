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
      res.render('home', { data: data, dataError: null });
    })
    .catch((err) => {
      console.log(err);
      res.render('home', { data: null, dataError: 'Sorry, the dashboard can\'t be loaded at this time.'});
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
  res.render('profile', {data: null});
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
    .then((user) => {
      res.send(user);
      // subscriptions requested
      //  const requestedSubscriptions = req.body.subscribe;
      //  let updatedSubscriptions = [];
    
      //  // If there are no current subscriptions
      //  if (subscriptions.length === 0) {
      //    updatedSubscriptions = requestedSubscriptions;
      //  } else {
      //    // Append requested subscriptions to current
      //    updatedSubscriptions = subscriptions.concat(requestedSubscriptions);
      //  }

      //  res.send(updatedSubscriptions);

      //        // TODO: Finish this insert
      //  
      //        // Insert into table (replacing current)
      //          .then()
      //            // redirect to profile page
      //            res.redirect(`/profile/${req.session.userID}`);
      //          .catch();
    })
    .catch((error) => {
      console.log(error);
      console.log('This is where it all failed');
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
// resolves with any subscriptions that user has in the database
// or rejects with an error.
// TODO: verify that this function works
function fetchSubscriptions(userID) {
  return new Promise((resolve, reject) => {
    // knex('users')
    //   .join('subscriptions', 'users.email', '=', 'subscriptions.user_email')
    //   .select('users.user_id, subscriptions.subscribed_currencies', 'subscriptions.user_email')
    //   .limit(1)
    knex.select('*').from('users').outerJoin('subscriptions', 'users.email', 'subscriptions.user_email')
        .then((user) => {
          console.log(user);
          resolve(user);
        })
        .catch((error) => {
          console.log('this failed.');
          reject(error);
        });
  });
}
