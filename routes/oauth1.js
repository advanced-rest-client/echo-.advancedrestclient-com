'use strict';

const express = require('express');
const {BaseRoute} = require('./base-route');
const login = require('connect-ensure-login');
// const {BaseResponse} = require('../models/base-response');
// const crypto = require('crypto');
const passport = require('passport');
const oauthorize = require('oauthorize');
const db = require('../oauth-db');
const utils = require('./oauth-utils');

// Passport configuration
require('./auth-init');

const router = express.Router();
const server = oauthorize.createServer();

server.serializeClient(function(client, done) {
  return done(null, client.id);
});

server.deserializeClient(function(id, done) {
  db.clients.find(id)
  .then(client => {
    return done(null, client);
  })
  .catch(cause => done(cause));
});

class Oauth1Route extends BaseRoute {
  constructor() {
    super();
    this.initRoute();
  }

  initRoute() {
    const requestTokenParams = [
      passport.authenticate('consumer', {
        session: false
      }),
      server.requestToken(this._onRequestToken.bind(this)),
      server.errorHandler()
    ];
    const accessTokenParams = [
      passport.authenticate('consumer', {
        session: false
      }),
      server.accessToken(
        this._verifyAccessToken.bind(this),
        this._issueAccessToken.bind(this)
      ),
      server.errorHandler()
    ];

    router.post('/request_token', requestTokenParams);
    router.post('/access_token', accessTokenParams);

    router.get('/dialog/authorize', [
      login.ensureLoggedIn('/#/login'),
      server.userAuthorization(this._userAuthorization.bind(this)),
      this._authorizationDialog.bind(this)
    ]);
    router.post('/dialog/authorize/decision', [
      login.ensureLoggedIn('/#/login'),
      server.userDecision(this._userDecision.bind(this)),
      this._noRedirect.bind(this)
    ]);

    // Login form for the user.
    router.get('/login', this._renderLoginForm.bind(this));
    router.post('/login', passport.authenticate('local', {
      successReturnToOrRedirect: '/#/account',
      failureRedirect: '/#/login',
      session: true
    }));
    router.get('/logout', this._logout.bind(this));
    router.get('/account', [
      login.ensureLoggedIn('/#/login'),
      this._account.bind(this)
    ]);
    router.get('/userinfo', [
      passport.authenticate('token', {
        session: false
      }),
      this._userInfo.bind(this)
    ]);
  }

  _onRequestToken(client, callbackURL, done) {
    const token = utils.uid(8);
    const secret = utils.uid(32);
    return db.requestTokens.save(token, secret, client.id, callbackURL)
    .then(() => {
      done(null, token, secret);
    })
    .catch(e => done(e));
  }
  /**
   * The `verify` callback is responsible for determining whether or not the
   * `verifier` is valid for the given `requestToken`. This step is necessary to
   * ensure that the application that requested authorization is the same one
   * exchanging the request token for an access token.
   */
  _verifyAccessToken(requestToken, verifier, info, done) {
    if (verifier !== info.verifier) {
      return done(null, false);
    }
    done(null, true);
  }
  /**
   * The `issue` callback is responsible for exhanging `requestToken` for an
   * access token and corresponding secret, which will be issued to the client.
   * This token will be used by the client to make requests on behalf of the
   * user.
   */
  _issueAccessToken(client, requestToken, info, done) {
    if (!info.approved) {
      return done(null, false);
    }
    if (client.id !== info.clientID) {
      return done(null, false);
    }

    const token = utils.uid(16);
    const secret = utils.uid(64);
    db.accessTokens.save(token, secret, info.userID, info.clientID)
    .then(() => done(null, token, secret))
    .catch(e => done(e));
  }

  _renderLoginForm(req, res) {
    res.redirect('/#/login');
  }

  _logout(req, res) {
    req.logout();
    res.redirect('/#/');
  }

  _account(req, res) {
    const accept = req.get('accept');
    if (accept === 'application/json') {
      this.sendObject(res, req.user, 200);
    } else {
      res.redirect('/#/account');
    }
  }

  _userAuthorization(requestToken, done) {
    var token;
    db.requestTokens.find(requestToken)
    .then(info => {
      token = info;
      return db.clients.find(token.clientID);
    })
    .then(client => {
      done(null, client, token.callbackURL);
    })
    .catch(e => done(e));
  }

  _authorizationDialog(req, res) {
    res.render('oauth1-dialog', {
      transactionID: req.oauth.transactionID,
      user: req.user,
      client: req.oauth.client
    });
  }

  _userDecision(requestToken, user, res, done) {
    var verifier = utils.uid(8);
    db.requestTokens.approve(requestToken, user.id, verifier)
    .then(() => {
      done(null, verifier);
    })
    .catch(e => done(e));
  }

  _noRedirect(req, res) {
    res.redirect('/#/oauth1-noredirect/' + req.oauth.verifier + '/' +
      req.oauth.authz.token);
  }

  _userInfo(req, res) {
    console.log('TEST');
    this.sendObject(res, {
      id: req.user.id,
      name: req.user.name
    });
  }
}
new Oauth1Route();
module.exports = router;
