'use strict';
const {BaseResponse} = require('./base-response');
/**
 * Base API response.
 */
class RequestDataResponse extends BaseResponse {
  /**
   * @param {Object} cookies List of cookies where key is cookie name and value
   * is cookie value.
   */
  constructor(opts) {
    super(true);
    opts = opts || {};

    if (opts.constructor && opts.constructor.name &&
        opts.constructor.name === 'IncomingMessage') {
      this._fromRequest(opts);
    } else {
      this._fromOptions(opts);
    }
  }

  _fromOptions(opts) {
    this.headers = opts.headers || {};
    this.method = opts.method || 'unknown';
    if (opts.body) {
      this.body = opts.body;
    }
  }

  _fromRequest(req) {
    this.headers = req.headers || {};
    this.method = req.method || 'unknown';
    if (req.body) {
      this.body = req.body;
    }
  }
}

module.exports.RequestDataResponse = RequestDataResponse;
