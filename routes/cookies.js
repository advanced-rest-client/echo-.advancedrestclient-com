'use strict';

const express = require('express');
const {BaseRoute} = require('./base-route');
const {CookieListResponse} = require('../models/cookie-list-response');
const {BaseResponse} = require('../models/base-response');

const router = express.Router();

class CookiesRoute extends BaseRoute {
  constructor() {
    super();
    this.initRoute();
  }

  initRoute() {
    router.get('/', this._onListCookies.bind(this));
    router.post('/', this._onCreateCookies.bind(this));
    router.delete('/', this._onDeleteCookies.bind(this));
    router.get('/set', this._onCreateCookiesUrl.bind(this));
    router.get('/delete', this._onDeleteCookiesUrl.bind(this));
  }

  _onListCookies(req, res) {
    const result = new CookieListResponse(req.cookies);
    this.sendObject(res, result);
  }

  _onCreateCookies(req, res) {
    const cookies = req.body;
    this.__setCookies(res, cookies);
  }

  _onCreateCookiesUrl(req, res) {
    const cookies = {};
    Object.keys(req.query).forEach(key => cookies[key] = req.query[key]);
    this.__setCookies(res, cookies);
  }

  __setCookies(res, cookies) {
    Object.keys(cookies).forEach(name => {
      res.cookie(name, cookies[name], {
        expires: new Date(Date.now() + 9000000)
      });
    });
    var result = new BaseResponse(true);
    this.sendObject(res, result);
  }

  _onDeleteCookies(req, res) {
    try {
      const cookies = Object.keys(req.body);
      this.__deleteCookies(res, cookies);
    } catch (e) {
      this.sendError(res, 400, e.message);
    }
  }

  _onDeleteCookiesUrl(req, res) {
    try {
      const cookies = Object.keys(req.query);
      this.__deleteCookies(res, cookies);
    } catch (e) {
      this.sendError(res, 400, e.message);
    }
  }

  __deleteCookies(res, cookies) {
    cookies.forEach(name => {
      res.clearCookie(name);
    });
    var result = new BaseResponse(true);
    this.sendObject(res, result);
  }
}
new CookiesRoute();
module.exports = router;
