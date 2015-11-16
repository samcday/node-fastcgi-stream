'use strict';

var assert = require('assert');
var fastcgi = require('../lib/');

describe('General constants', function() {
  it('VERSION', function() {
    assert.equal(fastcgi.constants.VERSION, 1);
  });
  
  it('HEADER_LEN', function() {
    assert.equal(fastcgi.constants.HEADER_LEN, 8);
  });
  
  it('NULL_REQUEST_ID', function() {
    assert.strictEqual(fastcgi.constants.NULL_REQUEST_ID, 0);
  });
});

// Check constants.
describe('BeginRequest Role constants', function() {
  it('RESPONDER', function() {
    assert.equal(fastcgi.records.BeginRequest.roles.RESPONDER, 1);
  });
  
  it('AUTHORIZER', function() {
    assert.equal(fastcgi.records.BeginRequest.roles.AUTHORIZER, 2);
  });
  
  it('FILTER', function() {
    assert.equal(fastcgi.records.BeginRequest.roles.FILTER, 3);
  });
});

describe('BeginRequest Flags constants', function() {
  it('KEEP_CONN', function() {
    assert.equal(fastcgi.records.BeginRequest.flags.KEEP_CONN);
  });
});

describe('EndRequest Protocol Status constants', function() {
  it('REQUEST_COMPLETE', function() {
    assert.equal(fastcgi.records.EndRequest.protocolStatus.REQUEST_COMPLETE, 0);
  });

  it('CANT_MPX_CONN', function() {
    assert.equal(fastcgi.records.EndRequest.protocolStatus.CANT_MPX_CONN, 1);
  });

  it('OVERLOADED', function() {
    assert.equal(fastcgi.records.EndRequest.protocolStatus.OVERLOADED, 2);
  });

  it('UNKNOWN_ROLE', function() {
    assert.equal(fastcgi.records.EndRequest.protocolStatus.UNKNOWN_ROLE, 3);
  });
});
