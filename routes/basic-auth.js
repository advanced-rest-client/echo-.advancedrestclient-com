'use strict';

const express = require('express');
const {BaseRoute} = require('./base-route');
const {Base64} = require('../lib/Base64');
const {BasicAuthResponse} = require('../models/basic-auth-response');

const router = express.Router();

class BasicAuthRoute extends BaseRoute {
  constructor() {
    super();
    this.initRoute();
  }

  initRoute() {
    router.get('/', this._setIndex.bind(this));
    router.get('/:uid/:passwd', this._setChallenge.bind(this));
  }

  _setIndex(req, res) {
    res.redirect('/auth/basic/user/passwd');
  }

  _setChallenge(req, res) {
    try {
      this._isAuthorized(req);
    } catch (e) {
      let obj = new BasicAuthResponse(false, e.message);
      res.status(401);
      res.set({
        'WWW-Authenticate': 'Basic realm="' + e.message + '"'
      });
      res.send(obj).end();
      return;
    }
    const obj = new BasicAuthResponse(true);
    this.sendObject(res, obj, 200);
  }

  _isAuthorized(req) {
    var authorization = req.get('authorization');
    if (!authorization) {
      throw new Error('No authorization header presented during the request');
    }
    authorization = authorization.substr(6).trim();
    if (!authorization) {
      throw new Error('Missing authorization value (after Basic).');
    }
    var pair;
    try {
      pair = Base64.atob(authorization).split(':');
    } catch (e) {
      throw new Error('Invalid base64 signature.');
    }
    if (pair.length !== 2) {
      throw new Error('Base64 signature is missing one of parameters.');
    }
    const uid = req.params.uid;
    const passwd = req.params.passwd;
    if (uid !== pair[0]) {
      throw new Error('Username is invalid');
    }
    if (passwd !== pair[1]) {
      throw new Error('Password is invalid');
    }
  }
}
new BasicAuthRoute();
module.exports = router;
