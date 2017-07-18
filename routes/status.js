'use strict';

const express = require('express');
const {BaseRoute} = require('./base-route');

const router = express.Router();

class StatusRoute extends BaseRoute {
  constructor() {
    super();
    this.initRoute();
  }

  initRoute() {
    router.get('/:code', this._setStatus.bind(this));
  }

  _setStatus(req, res) {
    var code = Number(req.params.code);
    if (code !== code) {
      res.status(400).send('Bad Request. Code is not a number.').end();
      return;
    }
    res.status(code).end();
  }
}
new StatusRoute();
module.exports = router;
