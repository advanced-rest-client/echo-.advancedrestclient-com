'use strict';

const express = require('express');
const {BaseRoute} = require('./base-route');
const {RequestDatatResponse} = require('../models/request-data-response');
const compression = require('compression');

const router = express.Router();

class CompressionRoute extends BaseRoute {
  constructor() {
    super();
    this.initRoute();
  }

  initRoute() {
    router.get('/gzip', [
      this._appendGzip.bind(this),
      compression({
        threshold: 1
      }),
      this._onResponse.bind(this)
    ]);

    router.get('/deflate', [
      this._appendDeflate.bind(this),
      compression({
        threshold: 1
      }),
      this._onResponse.bind(this)
    ]);
  }

  _appendGzip(req, res, next) {
    this._processRequest(req, 'gzip');
    next();
  }

  _appendDeflate(req, res, next) {
    this._processRequest(req, 'deflate');
    next();
  }

  _processRequest(req, value) {
    var enc = req.get('accept-encoding');
    if (enc) {
      enc = enc.toLowerCase();
    }
    if (enc === value) {
      return;
    }
    req.rawHeaders = req.rawHeaders || [];
    if (enc) {
      for (let i = 0, len = req.rawHeaders.length; i < len; i+=2) {
        let h = req.rawHeaders[i];
        if (h && h.toLowerCase() === 'accept-encoding') {
        	req.rawHeaders.splice(i, 2);
          break;
        }
      }
    }
    req.headers['accept-encoding'] = value;
    req.rawHeaders.push('accept-encoding');
    req.rawHeaders.push(value);
  }

  _onResponse(req, res) {
    var result = new RequestDatatResponse(req);
    this.sendObject(res, result, 200);
  }
}
new CompressionRoute();
module.exports = router;
