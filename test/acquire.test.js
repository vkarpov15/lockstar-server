'use strict';

const { MongoClient } = require('mongodb');
const assert = require('assert');

describe('acquire()', function() {
  let acquire;
  let client;
  let db;

  before(async function() {
    client = await MongoClient.connect('mongodb://localhost:27017/lockstar');
    db = client.db('lockstar');
    acquire = require('../src/acquire')(db);
  });

  after(function() {
    client.close();
  });

  beforeEach(async function() {
    await db.collection('Lock').deleteMany({});
  });

  it('throws if conflict', async function() {
    let threw = false;
    try {
      await Promise.all([
        acquire({ apiKey: 'foo', lockId: 'bar' }),
        acquire({ apiKey: 'foo', lockId: 'bar' })
      ]);
    } catch (error) {
      threw = true;
      assert.equal(error.toString(), 'Conflict: Resource "bar" is locked');
    }

    assert.ok(threw);
  });

  it('handles lock timeout', async function() {
    await acquire({ apiKey: 'foo', lockId: 'bar', timeout: 10 });

    await new Promise(resolve => setTimeout(() => resolve(), 20));

    await acquire({ apiKey: 'foo', lockId: 'bar', timeout: 10 });
  });
});
