'use strict';

const express = require('express');
const {BaseRoute} = require('./base-route');
const {RequestDataResponse} = require('../models/request-data-response');
const router = express.Router();
/**
 * Route to print GET data
 */
class GetRoute extends BaseRoute {
  /**
   * @constructor
   */
  constructor() {
    super();
    this.initRoute();
  }
  /**
   * Initializes route
   */
  initRoute() {
    router.get('/', this._onGet.bind(this));
  }
  /**
   * Handles `/` route.
   *
   * @param {Object} req
   * @param {Object} res
   */
  _onGet(req, res) {
    const result = new RequestDataResponse(req);
    this.sendObject(res, result, 200);
  }
}
new GetRoute();
module.exports = router;
