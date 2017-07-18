'use strict';

/**
 * Abstraction layer for string to base64 conversion
 * reference: https://github.com/nodejs/node/issues/3462
 */
class Base64 {
  /**
   * Creates a base-64 encoded ASCII string from a "string" of binary data.
   * @param {string} string to be encoded.
   * @return {string}
   * @static
   */
  static btoa(string) {
    if (typeof btoa === 'function') {
      return btoa(string);
    }

    return new Buffer(string.toString(), 'binary');
  }

  static atob(string) {
    if (typeof atob === 'function') {
      return atob(string);
    }
    return Buffer.from(string, 'base64').toString();
  }
}

module.exports.Base64 = Base64;
