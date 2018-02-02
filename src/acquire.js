'use strict';

const Archetype = require('archetype');
const Conflict = require('./error/conflict');
const _ = require('lodash');
const assert = require('assert');

const AcquireParams = new Archetype({
  apiKey: {
    $type: 'string',
    $required: true
  },
  lockId: {
    $type: 'string',
    $required: true
  },
  timeout: {
    $type: 'number',
    $default: 1000,
    $required: true,
    $validate: v => assert.ok(v <= 5000, `Invalid timeout ${v} > 5000`)
  }
}).compile('AcquireParams');

module.exports = db => async function(params) {
  const { apiKey, lockId, timeout } = new AcquireParams(params);

  const q = { apiKey, lockId, expiresAt: { $gte: new Date() } };
  const u = { $setOnInsert: { expiresAt: new Date(Date.now() + timeout) } };
  const o = { returnOriginal: false, upsert: true };
  const res = await db.collection('Lock').findOneAndUpdate(q, u, o);

  if (_.get(res, 'lastErrorObject.updatedExisting') !== false) {
    throw new Conflict(`Resource "${lockId}" is locked`);
  }

  return { lock: res.value };
};
