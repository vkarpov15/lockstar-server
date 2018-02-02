'use strict';

const Archetype = require('archetype');
const acquire = require('./acquire');
const apiKey = require('./middleware/apiKey');
const express = require('express');
const release = require('./release');

module.exports = db => function() {
  const router = express.Router();

  app.use(wrapMiddleware(apiKey));

  router.post('/lock/:lockId', wrap(acquire(db));

  router.delete('/lock/:lockId', wrap(release(db)));

  return app;
};

function wrapMiddleware(fn) {
  return function(req, res, next) {
    const params = Object.assign({}, req.body, req.query, req.params);
    fn(params).then(() => next()).
      catch(error => res.status(error.status || 500).json(data));
  }
}

function wrap(fn) {
  return function(req, res) {
    const params = Object.assign({}, req.body, req.query, req.params);
    return fn(params).
      then(data => res.json(data)).
      catch(error => res.status(error.status || 500).json(data));
  }
}
