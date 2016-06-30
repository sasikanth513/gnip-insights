'use strict';

const test = require('tape');
const nock = require('nock');

const gnip = require('./../lib/client');
const gnipResponse = require('./responses/gnip-success-response');

const API_URL = 'https://data-api.twitter.com';
const TOTALS_PATH = 'insights/engagement/totals';

const credentials = {
  consumer_key: 'consumerKey',
  consumer_secret: 'consumerSecret',
  token: 'accessToken',
  token_secret: 'accessTokenSecret'
};

test('it should throw bad credentials error', (assert) => {
  let error;
  try {
    gnip({});
  } catch (err) {
    error = err;
  }

  assert.equal(error.message, 'invalid credentials');
  assert.end();
});

test('it should return object when json response', (assert) => {
  nock(API_URL)
    .post('/' + TOTALS_PATH)
    .reply(200, gnipResponse);

  const request = gnip(credentials);

  request(TOTALS_PATH, {})
    .then(data => {
      assert.equal(data.errors.length, 1);
      assert.equal(data.totals['423456789'].favorites, '67');
      nock.cleanAll();
    })
    .then(() => assert.end())
    .catch(err => {
      nock.cleanAll();
      assert.end(err);
    });
});

test('it should return error when request fails', (assert) => {
  nock(API_URL).post('/' + TOTALS_PATH).reply(500);

  const request = gnip(credentials);

  request(TOTALS_PATH, {})
    .then(data => assert.end(new Error('unexpected data:' + data)))
    .catch(err => {
      assert.equal(!!err, true);
    })
    .then(() => {
      nock.cleanAll();
      assert.end();
    })
    .catch(err => {
      nock.cleanAll();
      assert.end(err);
    });
});
