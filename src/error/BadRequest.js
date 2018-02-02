'use strict';

class BadRequest extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'BadRequest';
    this.status = 400;
  }
}

module.exports = BadRequest;
