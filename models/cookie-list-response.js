'use strict';
const {BaseResponse} = require('./base-response');
/**
 * Base API response.
 */
class CookieListResponse extends BaseResponse{
  /**
   * @param {Object} cookies List of cookies where key is cookie name and value
   * is cookie value.
   */
  constructor(cookies) {
    super(true);
    this.cookies = cookies;
  }
}

module.exports.CookieListResponse = CookieListResponse;
