'use strict';

const { MongoClient } = require('mongodb');
const assert = require('assert');

describe('apiKey()', function() {
  let apiKey;
  let client;
  let db;

  before(async function() {
    client = await MongoClient.connect('mongodb://localhost:27017/lockstar');
    db = client.db('lockstar');
    apiKey = require('../src/middleware/apiKey')(db);
  });

  after(function() {
    client.close();
  });

  beforeEach(async function() {
    await db.collection('Usage').deleteMany({});
    await db.collection('Client').deleteMany({});
  });

  it('throws if past monthly limit', async function() {
    const client = { apiKey: 'foo', monthlyLimit: 2 };
    await db.collection('Client').insertOne(client);

    await apiKey({ apiKey: 'foo' });
    await apiKey({ apiKey: 'foo' });

    let threw = false;
    try {
      await apiKey({ apiKey: 'foo' });
    } catch (error) {
      threw = true;
      assert.equal(error.toString(), 'BadRequest: You have exceeded your monthly limit of 2 requests');
    }

    assert.ok(threw);
  });
});
