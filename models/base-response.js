'use strict';

/**
 * Base API response.
 */
class BaseResponse {
  /**
   * @param {Boolean} success Wherther or not the operation succeeded.
   */
  constructor(success) {
    this.success = success;
  }
}

module.exports.BaseResponse = BaseResponse;
