'use strict';
const {BaseResponse} = require('./base-response');
/**
 * Base API response.
 */
class HeadersDatatResponse extends BaseResponse{
  /**
   * @param {Object} headers List of headers.
   */
  constructor(headers) {
    super(true);
    this.headers = headers || {};
  }
}

module.exports.HeadersDatatResponse = HeadersDatatResponse;
