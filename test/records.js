'use strict';

var assert = require('assert');
var fastcgi = require('../lib/');

function createRecordSanityChecks(opts) {
  var record = new opts.class();
  if (opts.props) {
    Object.keys(opts.props).forEach(function(valueName) {
      record[valueName] = opts.props[valueName];
    });
  }

  describe('Record type ' + opts.class.name, function() {
    if(opts.expectedSize !== undefined) {
      it('calculates its size correctly', function() {
        assert.equal(record.getSize(), opts.expectedSize);
      });
    }
    if(opts.expectedType) {
      it('record has correct type', function() {
        assert.equal(record.TYPE, opts.expectedType);
      });

      it('record constructor has correct type', function() {
        assert.equal(opts.class.TYPE, opts.expectedType);
      });
    }
  });
}

createRecordSanityChecks({
  class: fastcgi.records.BeginRequest,
  expectedSize: 8,
  expectedType: 1
});

createRecordSanityChecks({
  class: fastcgi.records.AbortRequest,
  expectedSize: 0,
  expectedType: 2
});

createRecordSanityChecks({
  class: fastcgi.records.EndRequest,
  expectedSize: 8,
  expectedType: 3
});

createRecordSanityChecks({
  class: fastcgi.records.Params,
  expectedSize: 0,
  expectedType: 4
});

createRecordSanityChecks({
  class: fastcgi.records.Params,
  props: {
    params: [
      ['Test', 'Value'],
      ['AnotherTest', 'AnotherValue']
    ]
  },
  expectedSize: 36
});

createRecordSanityChecks({
  class: fastcgi.records.Params,
  props: {
    params: [
      ['Test', 'Value'],
      ['ThisIsAReallyLongHeaderNameItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah', 'ThisIsAReallyLongHeaderValueItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah']
    ]
  },
  expectedSize: 280
});

createRecordSanityChecks({
  class: fastcgi.records.Params,
  props: {
    params: [
      ['Параметр', 'Значение']
    ]
  },
  expectedSize: 1 + 16 + 1 + 16
});

createRecordSanityChecks({
  class: fastcgi.records.Params,
  props: {
    params: [
      ['Параметр', 'Очень-очень-длинное-значение-которое-явно-больше-ста-двадцати-семи-байт-в-длину']
    ]
  },
  expectedSize: 1 + 16 + 4 + 146
});

createRecordSanityChecks({
  class: fastcgi.records.StdIn,
  expectedSize: 0,
  expectedType: 5
});

createRecordSanityChecks({
  class: fastcgi.records.StdIn,
  props: {
    data: 'Hello'
  },
  expectedSize: 5
});

createRecordSanityChecks({
  class: fastcgi.records.StdIn,
  props: {
    data: '\u00bd + \u00bc = \u00be'
  },
  expectedSize: 12
});

createRecordSanityChecks({
  class: fastcgi.records.StdIn,
  props: {
    data: new Buffer(10)
  },
  expectedSize: 10
});

createRecordSanityChecks({
  class: fastcgi.records.StdOut,
  expectedSize: 0,
  expectedType: 6
});

createRecordSanityChecks({
  class: fastcgi.records.StdOut,
  props: {
    data: 'Hello'
  },
  expectedSize: 5
});

createRecordSanityChecks({
  class: fastcgi.records.StdOut,
  props: {
    data: '\u00bd + \u00bc = \u00be'
  },
  expectedSize: 12
});

createRecordSanityChecks({
  class: fastcgi.records.StdOut,
  props: {
    data: new Buffer(10)
  },
  expectedSize: 10
});

createRecordSanityChecks({
  class: fastcgi.records.StdErr,
  expectedSize: 0,
  expectedType: 7
});

createRecordSanityChecks({
  class: fastcgi.records.StdErr,
  props: {
    data: 'Hello'
  },
  expectedSize: 5
});

createRecordSanityChecks({
  class: fastcgi.records.StdErr,
  props: {
    data: '\u00bd + \u00bc = \u00be'
  },
  expectedSize: 12
});

createRecordSanityChecks({
  class: fastcgi.records.StdErr,
  props: {
    data: new Buffer(10)
  },
  expectedSize: 10
});

createRecordSanityChecks({
  class: fastcgi.records.Data,
  expectedSize: 0,
  expectedType: 8
});

createRecordSanityChecks({
  class: fastcgi.records.Data,
  props: {
    data: 'Hello'
  },
  expectedSize: 5
});

createRecordSanityChecks({
  class: fastcgi.records.Data,
  props: {
    data: '\u00bd + \u00bc = \u00be'
  },
  expectedSize: 12
});

createRecordSanityChecks({
  class: fastcgi.records.Data,
  props: {
    data: new Buffer(10)
  },
  expectedSize: 10
});

createRecordSanityChecks({
  class: fastcgi.records.GetValues,
  expectedSize: 0,
  expectedType: 9
});

createRecordSanityChecks({
  class: fastcgi.records.GetValues,
  props: {
    values: ['Test', 'AnotherTest']
  },
  expectedSize: 19
});

createRecordSanityChecks({
  class: fastcgi.records.GetValues,
  props: {
    values: ['Test', 'ThisIsAReallyLongHeaderNameItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah']
  },
  expectedSize: 141
});

createRecordSanityChecks({
  class: fastcgi.records.GetValuesResult,
  expectedSize: 0,
  expectedType: 10
});

createRecordSanityChecks({
  class: fastcgi.records.GetValuesResult,
  props: {
    values: [
      ['Test', 'Value'],
      ['AnotherTest', 'AnotherValue']
    ]
  },
  expectedSize: 36
});

createRecordSanityChecks({
  class: fastcgi.records.GetValuesResult,
  props: {
    values: [
      ['Test', 'Value'],
      ['ThisIsAReallyLongHeaderNameItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah', 'ThisIsAReallyLongHeaderValueItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah']
    ]
  },
  expectedSize: 280
});

createRecordSanityChecks({
  class: fastcgi.records.UnknownType,
  expectedSize: 8,
  expectedType: 11
});