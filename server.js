const knex = require('./db');

const express = require('express');

const app = express();

const cookieSession = require('cookie-session');

const bodyParser = require('body-parser');

const bcrypt = require('bcrypt-as-promised');

const PORT = process.env.PORT || 8000;

app.set('view engine', 'ejs');

// parse application/x-www-form-urlencoded 
// Adds to req.body
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.render('home');
});

// Render ./views/login.ejs
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Verify login credentials
// If valid, redirect to GET /profile
app.post('/login', (req, res) => {
  // Grab data from request body (parsed by middleware)
  const email = req.body.email;
  const password = req.body.password;
  // Verify login
  // Return array of users that match given email
  knex('users').where({ email: email })
    .then((users) => {
      users.forEach((user) => {
        bcrypt.compare(password, user.password_digest)
          .then(() => {
            // if password is correct
            res.redirect(`/profile/${user.first_name}${user.last_name}`);
          })
          .catch((err) => {
            console.log(err);
            res.render('login', { error: 'Incorrect password.' });
          });
      });
    })
    .catch((err) => {
      // If database query fails/returns no users with given email
      // Reload login page again with error message
      console.log(err);
      res.render('/login', { error: 'Couldn\'t find a user with that email address.' });
    });
});

// Render ./views/signup.ejs
app.get('/signup', (req, res) => {
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
      })
        .then(() => {
          // if table insert completes
          res.redirect(`/profile/${req.body.first_name}${req.body.last_name}`);
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
  res.render('profile');
});

app.listen(PORT, () => {
  console.log('This server is listening to Fresh Air on WNYC port', PORT);
});
