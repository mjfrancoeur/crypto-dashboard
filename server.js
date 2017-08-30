const knex = require('./db');

const express = require('express');

const app = express();

const PORT = process.env.PORT || 8000;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('home');
});

// Render ./views/login.ejs
app.get('/login', (req, res) => {
  res.render('login');
});

// Verify login credentials
// If valid, redirect to GET /profile
app.post('/login', (req, res) => {
  // Verify login
  
  // Redirect to GET /profile/email
  // res.redirect('/profile/${email});
});

// Render ./views/signup.ejs
app.get('/signup', (req, res) => {
  res.render('signup');
});

// Verify that all necessary info has been input
// Add user entry to user database
// If valid, redirect to GET /profile
app.post('/signup', (req, res) => {
  
  // If valid, redirect to profile page
  res.render('/profile/email');
});

// Direct user to their profile page
// If user is logged in / authorized
app.get('/profile/:id', (req, res) => {
  res.render('profile');
});

app.listen(PORT, () => {
  console.log('This server is listening to Fresh Air on WNYC port', PORT);
});
