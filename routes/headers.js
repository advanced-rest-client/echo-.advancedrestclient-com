'use strict';

const express = require('express');
const {BaseRoute} = require('./base-route');
const {HeadersDatatResponse} = require('../models/headers-data-response');
const router = express.Router();

class HeadersRoute extends BaseRoute {
  constructor() {
    super();
    this.initRoute();
  }

  initRoute() {
    router.get('/', this._listIncommingHeadersGet.bind(this));
    router.post('/', this._listIncommingHeadersBody.bind(this));
    router.get('/response', this._listIncommingHeadersQuery.bind(this));
  }
  // Headers from request
  _listIncommingHeadersGet(req, res) {
    this._listHeaders(res, req.headers);
  }
  // Output headers list
  _listHeaders(res, headers) {
    var response = new HeadersDatatResponse(headers);
    this.sendObject(res, response, 200);
  }
  // headers from request body
  _listIncommingHeadersBody(req, res) {
    try {
      const headers = req.body;
      this.__listHeaders(res, headers);
    } catch (e) {
      this.sendError(res, 400, e.message);
    }
  }
  // Headers from query string
  _listIncommingHeadersQuery(req, res) {
    try {
      const headers = {};
      Object.keys(req.query).forEach(key => {
        if (key in headers) {
          headers[key] += '; ' + req.query[key];
        } else {
          headers[key] = req.query[key];
        }
      });
      this.__listHeaders(res, headers);
    } catch (e) {
      this.sendError(res, 400, e.message);
    }
  }
}
new HeadersRoute();
module.exports = router;
