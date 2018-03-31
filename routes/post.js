'use strict';

const express = require('express');
const {BaseRoute} = require('./base-route');
const {RequestDataResponse} = require('../models/request-data-response');
const router = express.Router();
/**
 * Route to print POST data
 */
class PostRoute extends BaseRoute {
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
    router.post('/', this._onPost.bind(this));
  }
  /**
   * Handles `/` route.
   *
   * @param {Object} req
   * @param {Object} res
   */
  _onPost(req, res) {
    const result = new RequestDataResponse(req);
    this.sendObject(res, result, 200);
  }
}
new PostRoute();
module.exports = router;
