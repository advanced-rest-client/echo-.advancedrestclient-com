'use strict';
const {ErrorResponse} = require('../models/error-response');

class BaseRoute {

  /**
   * Sends an error response to the client.
   *
   * @param {Object} resp Express response object.
   * @param {Number} code Error status code. Default 400.
   * @param {String} message A reason message. Default empty string.
   */
  sendError(resp, code, message) {
    const error = new ErrorResponse(code, message);
    const body = JSON.stringify(error, null, 2);
    resp.set('Content-Type', 'application/json');
    resp.status(code || 400).send(body);
  }
  /**
   * Send an API success response.
   * @param {Object} resp Express response object.
   * @param {Object} obj An object to stringnify and send.
   * @param {Number} statusCode Response status code. Default 200.
   */
  sendObject(resp, obj, statusCode) {
    statusCode = statusCode || 200;
    obj = obj || {};
    const body = JSON.stringify(obj, null, 2);
    resp.set('Content-Type', 'application/json');
    resp.status(statusCode).send(body);
  }
}

module.exports.BaseRoute = BaseRoute;
