'use strict';

const { MongoClient } = require('mongodb');
const assert = require('assert');

describe('release()', function() {
  let acquire;
  let client;
  let db;
  let release;

  before(async function() {
    client = await MongoClient.connect('mongodb://localhost:27017/lockstar');
    db = client.db('lockstar');
    acquire = require('../src/acquire')(db);
    release = require('../src/release')(db);
  });

  after(function() {
    client.close();
  });

  beforeEach(async function() {
    await db.collection('Lock').deleteMany({});
  });

  it('acquire() then release()', async function() {
    await acquire({ apiKey: 'foo', lockId: 'bar', timeout: 1000 });

    const { lock } = await release({ apiKey: 'foo', lockId: 'bar' });
    assert.ok(lock);

    await acquire({ apiKey: 'foo', lockId: 'bar', timeout: 10 });
  });
});
