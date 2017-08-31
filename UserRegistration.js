const db = require('./db');

const bcrypt = require('bcrypt-as-promised');

function userRegistration({ req: req, res: res, }) {
  return new Promise((resolve, reject) => {
    // Find users that match email in db
    db('users').where({ email: req.body.email })
      // Returns an array of possible matches
      .then((users) => {

        // If there are no matches
        if (users.length === 0) {
          return res.render('login', { error: 'Couldn\'t find a user with that email address.'});
        }
        // Verify password
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
      .catch((err) => {
        return reject(err);
      });
  });
}

function verifyPassword(user, req) {

}

function addCookieSessionId(user, req) {

}

module.exports = userRegistration();
