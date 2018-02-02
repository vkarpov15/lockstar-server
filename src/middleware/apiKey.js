const Archetype = require('archetype');
const BadRequest = require('../error/BadRequest');
const moment = require('moment');

const APIKeyParams = new Archetype({
  apiKey: {
    $type: 'string',
    $required: true
  }
}).compile('APIKeyParams');

module.exports = db => async function(params) {
  const { apiKey } = new APIKeyParams(params);

  const client = await db.collection('Client').findOne({ apiKey });
  if (client == null) {
    throw new BadRequest(`API Key ${apiKey} not found`);
  }

  const { monthlyLimit } = client;

  const month = moment().format('YYYYMM');

  const opts = { upsert: true, returnOriginal: false };
  const usage = await db.collection('Usage').
    findOneAndUpdate({ _id: apiKey, month }, { $inc: { hits: 1 } }, opts).
    then(res => res.value);

  if (usage.hits > monthlyLimit) {
    throw new BadRequest(`You have exceeded your monthly limit of ${monthlyLimit} requests`);
  }
};
