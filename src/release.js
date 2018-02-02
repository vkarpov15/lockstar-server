'use strict';

const Archetype = require('archetype');
const _ = require('lodash');

const ReleaseParams = new Archetype({
  apiKey: {
    $type: 'string',
    $required: true
  },
  lockId: {
    $type: 'string',
    $required: true
  }
}).compile('ReleaseParams');

module.exports = db => async function(params) {
  const { apiKey, lockId } = new ReleaseParams(params);

  const q = { apiKey, lockId };
  const o = { returnOriginal: false };
  const res = await db.collection('Lock').findOneAndDelete(q, o);

  return { lock: res.value };
};
