'use strict';

class Conflict extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'Conflict';
    this.status = 409;
  }
}

module.exports = Conflict;
