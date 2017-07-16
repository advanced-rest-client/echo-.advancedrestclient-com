/**
 * Module dependencies.
 */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {ConsumerStrategy, TokenStrategy} = require('passport-http-oauth');
const db = require('../oauth-db');
/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(new LocalStrategy(
  function(username, password, done) {
    db.users.findByUsername(username)
    .then((user) => {
      if (!user) {
        done(null, false, {
          message: 'Incorrect username.'
        });
        return;
      }
      if (user.password !== password) {
        done(null, false, {
          message: 'Incorrect password.'
        });
        return;
      }
      done(null, user);
      return;
    })
    .catch(cause => done(cause));
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.users.find(id)
  .then(user => {
    done(null, user);
  })
  .catch(cause => done(cause));
});


/**
 * ConsumerStrategy
 *
 * This strategy is used to authenticate registered OAuth consumers (aka
 * clients).  It is employed to protect the `request_tokens` and `access_token`
 * endpoints, which consumers use to request temporary request tokens and access
 * tokens.
 */
passport.use('consumer', new ConsumerStrategy(
  // consumer callback
  //
  // This callback finds the registered client associated with `consumerKey`.
  // The client should be supplied to the `done` callback as the second
  // argument, and the consumer secret known by the server should be supplied
  // as the third argument.  The `ConsumerStrategy` will use this secret to
  // validate the request signature, failing authentication if it does not
  // match.
  function(consumerKey, done) {
    db.clients.findByConsumerKey(consumerKey)
    .then(client => {
      if (!client) {
        return done(null, false, 'Unknown consumer key');
      }
      done(null, client, client.consumerSecret);
    })
    .catch(cause => done(cause));
  },
  // token callback
  //
  // This callback finds the request token identified by `requestToken`.  This
  // is typically only invoked when a client is exchanging a request token for
  // an access token.  The `done` callback accepts the corresponding token
  // secret as the second argument.  The `ConsumerStrategy` will use this secret to
  // validate the request signature, failing authentication if it does not
  // match.
  //
  // Furthermore, additional arbitrary `info` can be passed as the third
  // argument to the callback.  A request token will often have associated
  // details such as the user who approved it, scope of access, etc.  These
  // details can be retrieved from the database during this step.  They will
  // then be made available by Passport at `req.authInfo` and carried through to
  // other middleware and request handlers, avoiding the need to do additional
  // unnecessary queries to the database.
  function(requestToken, done) {
    db.requestTokens.find(requestToken)
    .then(token => {
      if (!token) {
        return done(null, false, 'Token not found');
      }
      var info = {
        verifier: token.verifier,
        clientID: token.clientID,
        userID: token.userID,
        approved: token.approved
      };
      done(null, token.secret, info);
    })
    .catch(cause => done(cause));
  },
  // validate callback
  //
  // The application can check timestamps and nonces, as a precaution against
  // replay attacks.  In this example, no checking is done and everything is
  // accepted.
  function(timestamp, nonce, done) {
    done(null, true);
  }
));

/**
 * TokenStrategy
 *
 * This strategy is used to authenticate users based on an access token.  The
 * user must have previously authorized a client application, which is issued an
 * access token to make requests on behalf of the authorizing user.
 */
passport.use('token', new TokenStrategy(
  // consumer callback
  //
  // This callback finds the registered client associated with `consumerKey`.
  // The client should be supplied to the `done` callback as the second
  // argument, and the consumer secret known by the server should be supplied
  // as the third argument.  The `TokenStrategy` will use this secret to
  // validate the request signature, failing authentication if it does not
  // match.
  function(consumerKey, done) {
    db.clients.findByConsumerKey(consumerKey)
    .then(client => {
      if (!client) {
        return done(null, false, 'Unknown consumer key');
      }
      done(null, client, client.consumerSecret);
    })
    .catch(cause => done(cause));
  },
  // verify callback
  //
  // This callback finds the user associated with `accessToken`.  The user
  // should be supplied to the `done` callback as the second argument, and the
  // token secret known by the server should be supplied as the third argument.
  // The `TokenStrategy` will use this secret to validate the request signature,
  // failing authentication if it does not match.
  //
  // Furthermore, additional arbitrary `info` can be passed as the fourth
  // argument to the callback.  An access token will often have associated
  // details such as scope of access, expiration date, etc.  These details can
  // be retrieved from the database during this step.  They will then be made
  // available by Passport at `req.authInfo` and carried through to other
  // middleware and request handlers, avoiding the need to do additional
  // unnecessary queries to the database.
  //
  // Note that additional access control (such as scope of access), is an
  // authorization step that is distinct and separate from authentication.
  // It is an application's responsibility to enforce access control as
  // necessary.
  function(accessToken, done) {
    var token;
    db.accessTokens.find(accessToken)
    .then(info => {
      console.log('Token info', info);
      if (!info) {
        return;
      }
      token = info;
      return db.users.find(token.userID);
    })
    .then(user => {
      console.log('User info', user);
      if (!user) {
        return done(null, false, 'Unknown access token');
      }
      // to keep this example simple, restricted scopes are not implemented
      var info = {
        scope: '*'
      };
      done(null, user, token.secret, info);
    })
    .catch(cause => done(cause));
  },
  // validate callback
  //
  // The application can check timestamps and nonces, as a precaution against
  // replay attacks.  In this example, no checking is done and everything is
  // accepted.
  function(timestamp, nonce, done) {
    done(null, true);
  }
));
