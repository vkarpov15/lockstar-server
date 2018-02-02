'use strict';

const Archetype = require('archetype');
const BadRequest = require('./error/BadRequest');
const _ = require('lodash');
const bcrypt = require('bcrypt');

const RegisterParams = new Archetype({
  email: {
    $type: 'string',
    $required: true
  },
  password: {
    $type: 'string',
    $required: true
  }
}).compile('RegisterParams');

module.exports = db => async function(params) {
  const { email, password } = new RegisterParams(params);

  const o = { returnOriginal: false, upsert: true };

  const chars = 'abcdefhijklmnopqrstuvwxyz0123456789';
  let apiKey = '';
  for (let i = 0; i < 32; ++i) {
    apiKey += chars.charAt(Math.floor(chars.length * Math.random()));
  }

  const res = await db.collection('Client').findOneAndUpdate({ email }, {
    $setOnInsert: {
      apiKey
    }
  }, o);

  if (_.get(res, 'lastErrorObject.updatedExisting') !== false) {
    throw new BadRequest(`User already exists with email ${email}`);
  }

  const pwHash = await new Promise((resolve, reject) => {
    bcrypt.hash(password, 6, (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });

  await db.collection('AuthenticationMechanism').insertOne({
    clientId: res.value._id,
    type: 'PASSWORD',
    pwHash
  })

  return { client: res.value };
};
