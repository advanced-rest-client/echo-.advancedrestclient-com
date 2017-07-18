'use strict';
const {BaseResponse} = require('./base-response');
/**
 * Base API response.
 */
class BasicAuthResponse extends BaseResponse{
  /**
   * @param {Object} cookies List of cookies where key is cookie name and value
   * is cookie value.
   */
  constructor(success, message) {
    super(success);
    if (message) {
      this.message = message;
    }
  }
}

module.exports.BasicAuthResponse = BasicAuthResponse;
