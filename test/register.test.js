'use strict';

const { MongoClient } = require('mongodb');
const assert = require('assert');

describe('register()', function() {
  let register;
  let client;
  let db;

  before(async function() {
    client = await MongoClient.connect('mongodb://localhost:27017/lockstar');
    db = client.db('lockstar');
    register = require('../src/register')(db);
  });

  after(function() {
    client.close();
  });

  beforeEach(async function() {
    await db.collection('Client').deleteMany({});
  });

  it('works', async function() {
    const { client } = await register({
      email: 'val@karpov.io',
      password: 'a1b2c3'
    });

    assert.equal(client.email, 'val@karpov.io');
    assert.equal(client.apiKey.length, 32);

    const auth = await db.collection('AuthenticationMechanism').findOne({
      clientId: client._id
    });

    assert.ok(auth);
    assert.equal(auth.type, 'PASSWORD');
  });
});
