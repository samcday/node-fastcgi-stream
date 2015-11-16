'use strict';

var common = require('./common');
var expect = require('chai').expect;
var fastcgi = require('../lib/');

function addReadRecordTests(theRecord) {
  switch(theRecord.TYPE) {
    case fastcgi.records.BeginRequest.TYPE: {
      it('*role* is correct', function() {
        expect(this.record.role).to.eql(theRecord.role);
      });
      
      it('*flags* is correct', function() {
        expect(this.record.flags).to.eql(theRecord.flags);
      });

      break;
    }
    
    case fastcgi.records.EndRequest.TYPE: {
      it('*appStatus* is correct', function() {
        expect(this.record.appStatus).to.eql(theRecord.appStatus);
      });

      it('*protocolStatus* is correct', function() {
        expect(this.record.protocolStatus).to.eql(theRecord.protocolStatus);
      });
      
      break;
    }
    
    case fastcgi.records.UnknownType.TYPE: {
      it('*type* is correct', function() {
        expect(this.record.type).to.eql(theRecord.type);
      });

      break;
    }
    
    case fastcgi.records.StdIn.TYPE:
    case fastcgi.records.StdOut.TYPE:
    case fastcgi.records.StdErr.TYPE:
    case fastcgi.records.Data.TYPE: {
      it('body data is correct', function() {
        var originalRecordBuffer = Buffer.isBuffer(theRecord.data) ? theRecord.data : new Buffer(theRecord.data);
        var actualRecordBuffer = Buffer.isBuffer(this.record.data) ? this.record.data : new Buffer(this.record.data);

        expect(actualRecordBuffer).to.eql(originalRecordBuffer);
      });

      break;
    }
    case fastcgi.records.Params.TYPE:
    case fastcgi.records.GetValues.TYPE:
    case fastcgi.records.GetValuesResult.TYPE: {
      it('params are correct', function() {
        var theParams;
        if (theRecord.TYPE === fastcgi.records.Params.TYPE) {
          theParams = this.record.params;
        } else {
          theParams = this.record.values;
        }
        var theRecordParams = theRecord.params || theRecord.values || theRecord.result;

        expect(theParams).to.deep.eql(theRecordParams);
      });

      break;
    }
  }
}

function createReadRecordTest(desc, chunkSize, theRecord) {
  if(typeof(chunkSize) !== 'number') {
    theRecord = chunkSize;
    chunkSize = undefined;
  }
  
  var theRequestId = Math.floor(Math.random() * 65535 + 1);

  describe(desc, function() {
    before(function(done) {
      var self = this;
      this.fastcgiStream = common.createFCGIStream(chunkSize);
      this.fastcgiStream.on('record', function(requestId, record) {
        self.requestId = requestId;
        self.record = record;
        done();
      }.bind(this));

      this.fastcgiStream.writeRecord(theRequestId, theRecord);
      var buf = this.fastcgiStream._writableStream.getContents();
      this.fastcgiStream._readableStream.put(buf);
    });

    it('read buffer was fully read', function() {
      expect(this.fastcgiStream._readableStream.size()).to.eql(0);
    });

    it('*requestId* is correct', function() {
      expect(this.requestId).to.eql(theRequestId);
    });

    it('record is correct type', function() {
      expect(this.record.TYPE).to.eql(theRecord.TYPE);
    });

    addReadRecordTests(theRecord);
  });
}

function createMultiReadRecordTest(desc, constructor) { 
  var requestIds = [];
  var records = [];
  var fastcgiStream = common.createFCGIStream();
  var theRecord = constructor();

  for(var i = 0; i < 5; i++) {
    var requestId = Math.floor(Math.random() * 65535 + 1);
    requestIds.push(requestId);

    records.push(theRecord);
    fastcgiStream.writeRecord(requestId, theRecord);
  }

  var buf = fastcgiStream._writableStream.getContents();
  
  describe(desc, function() {
    before(function(done) {
      this.actualRequestIds = [];
      this.actualRecords = [];

      fastcgiStream.on('record', function(requestId, record) {
        this.actualRequestIds.push(requestId);
        this.actualRecords.push(record);
        if(this.actualRequestIds.length == 5) done();
      }.bind(this));
      
      fastcgiStream._readableStream.put(buf);
    });
    for(var i = 0; i < 5; i++) {
      describe('(record #' + i + ')', (function(i) {
        return function() {
          before(function() {
            this.requestId = this.actualRequestIds[i];
            this.record = this.actualRecords[i];
          });

          it('*requestId* is correct', function() {
            expect(this.requestId).to.eql(requestIds[i]);
          });

          it('record is correct type', function() {
            expect(this.record.TYPE).to.eql(records[i].TYPE);
          });

          addReadRecordTests(theRecord);
        };
      })(i));
    }
  });
}

// We're verifying the record reading against records written out by the same system.
// You might consider this dumb, but I think it's okay, given that we've already run a shiteload of sanity checks on the records.
// And we've tested the raw binary output of the writing process, making sure it's according to spec.
describe('FastCGIStream reading', function() {
  createReadRecordTest('an FCGI_BEGIN_REQUEST', new fastcgi.records.BeginRequest(fastcgi.records.BeginRequest.roles.Responder, 254));
  createReadRecordTest('an FCGI_ABORT_REQUEST', new fastcgi.records.AbortRequest());
  createReadRecordTest('an FCGI_END_REQUEST', new fastcgi.records.EndRequest(4294967295, 254));
  createReadRecordTest('an FCGI_PARAMS (empty)', new fastcgi.records.Params());
  createReadRecordTest('an FCGI_PARAMS (small name/value pairs)', new fastcgi.records.Params(common.fixtures.smallParams));
  createReadRecordTest('an FCGI_PARAMS (large name/value pairs)', new fastcgi.records.Params(common.fixtures.largeParams));
  createReadRecordTest('an FCGI_STDIN (empty)', new fastcgi.records.StdIn());
  createReadRecordTest('an FCGI_STDIN (string)', new fastcgi.records.StdIn(common.fixtures.basicString));
  createReadRecordTest('an FCGI_STDIN (unicode string)', new fastcgi.records.StdIn(common.fixtures.unicodeString));
  createReadRecordTest('an FCGI_STDIN (buffer)', new fastcgi.records.StdIn(common.createDummyBuffer()));
  createReadRecordTest('an FCGI_STDOUT (empty)', new fastcgi.records.StdOut());
  createReadRecordTest('an FCGI_STDOUT (string)', new fastcgi.records.StdOut(common.fixtures.basicString));
  createReadRecordTest('an FCGI_STDOUT (unicode string)', new fastcgi.records.StdOut(common.fixtures.unicodeString));
  createReadRecordTest('an FCGI_STDOUT (buffer)', new fastcgi.records.StdOut(common.createDummyBuffer()));
  createReadRecordTest('an FCGI_STDERR (empty)', new fastcgi.records.StdErr());
  createReadRecordTest('an FCGI_STDERR (string)', new fastcgi.records.StdErr(common.fixtures.basicString));
  createReadRecordTest('an FCGI_STDERR (unicode string)', new fastcgi.records.StdErr(common.fixtures.unicodeString));
  createReadRecordTest('an FCGI_STDERR (buffer)', new fastcgi.records.StdErr(common.createDummyBuffer()));
  createReadRecordTest('an FCGI_DATA (empty)', new fastcgi.records.Data());
  createReadRecordTest('an FCGI_DATA (string)', new fastcgi.records.Data(common.fixtures.basicString));
  createReadRecordTest('an FCGI_DATA (unicode string)', new fastcgi.records.Data(common.fixtures.unicodeString));
  createReadRecordTest('an FCGI_DATA (buffer)', new fastcgi.records.Data(common.createDummyBuffer()));
  createReadRecordTest('an FCGI_GET_VALUES (empty)', new fastcgi.records.GetValues());
  createReadRecordTest('an FCGI_GET_VALUES (small name/value pairs)', new fastcgi.records.GetValues(common.fixtures.smallKeys));
  createReadRecordTest('an FCGI_GET_VALUES (large name/value pairs)', new fastcgi.records.GetValues(common.fixtures.largeKeys));
  createReadRecordTest('an FCGI_GET_VALUES_RESULT (empty)', new fastcgi.records.GetValuesResult());
  createReadRecordTest('an FCGI_GET_VALUES_RESULT (small name/value pairs)', new fastcgi.records.GetValuesResult(common.fixtures.smallParams));
  createReadRecordTest('an FCGI_GET_VALUES_RESULT (large name/value pairs)', new fastcgi.records.GetValuesResult(common.fixtures.largeParams));
  createReadRecordTest('an FCGI_UNKNOWN_TYPE', new fastcgi.records.UnknownType(common.fixtures.largeByte));
});

describe('FastCGIStream reading (trickle-fed)', function() {
  createReadRecordTest('an FCGI_BEGIN_REQUEST', 1, new fastcgi.records.BeginRequest(fastcgi.records.BeginRequest.roles.Responder, 254));
  createReadRecordTest('an FCGI_ABORT_REQUEST', 1, new fastcgi.records.AbortRequest());
  createReadRecordTest('an FCGI_END_REQUEST', 1, new fastcgi.records.EndRequest(4294967295, 254));
  createReadRecordTest('an FCGI_PARAMS (empty)', 1, new fastcgi.records.Params());
  createReadRecordTest('an FCGI_PARAMS (small name/value pairs)', 1, new fastcgi.records.Params(common.fixtures.smallParams));
  createReadRecordTest('an FCGI_PARAMS (large name/value pairs)', 1, new fastcgi.records.Params(common.fixtures.largeParams));
  createReadRecordTest('an FCGI_STDIN (empty)', 1, new fastcgi.records.StdIn());
  createReadRecordTest('an FCGI_STDIN (string)', 1, new fastcgi.records.StdIn(common.fixtures.basicString));
  createReadRecordTest('an FCGI_STDIN (unicode string)', 1, new fastcgi.records.StdIn(common.fixtures.unicodeString));
  createReadRecordTest('an FCGI_STDIN (buffer)', 1, new fastcgi.records.StdIn(common.createDummyBuffer()));
  createReadRecordTest('an FCGI_STDOUT (empty)', 1, new fastcgi.records.StdOut());
  createReadRecordTest('an FCGI_STDOUT (string)', 1, new fastcgi.records.StdOut(common.fixtures.basicString));
  createReadRecordTest('an FCGI_STDOUT (unicode string)', 1, new fastcgi.records.StdOut(common.fixtures.unicodeString));
  createReadRecordTest('an FCGI_STDOUT (buffer)', 1, new fastcgi.records.StdOut(common.createDummyBuffer()));
  createReadRecordTest('an FCGI_STDERR (empty)', 1, new fastcgi.records.StdErr());
  createReadRecordTest('an FCGI_STDERR (string)', 1, new fastcgi.records.StdErr(common.fixtures.basicString));
  createReadRecordTest('an FCGI_STDERR (unicode string)', 1, new fastcgi.records.StdErr(common.fixtures.unicodeString));
  createReadRecordTest('an FCGI_STDERR (buffer)', 1, new fastcgi.records.StdErr(common.createDummyBuffer()));
  createReadRecordTest('an FCGI_DATA (empty)', 1, new fastcgi.records.Data());
  createReadRecordTest('an FCGI_DATA (string)', 1, new fastcgi.records.Data(common.fixtures.basicString));
  createReadRecordTest('an FCGI_DATA (unicode string)', 1, new fastcgi.records.Data(common.fixtures.unicodeString));
  createReadRecordTest('an FCGI_DATA (buffer)', 1, new fastcgi.records.Data(common.createDummyBuffer()));
  createReadRecordTest('an FCGI_GET_VALUES (empty)', 1, new fastcgi.records.GetValues());
  createReadRecordTest('an FCGI_GET_VALUES (small name/value pairs)', 1, new fastcgi.records.GetValues(common.fixtures.smallKeys));
  createReadRecordTest('an FCGI_GET_VALUES (large name/value pairs)', 1, new fastcgi.records.GetValues(common.fixtures.largeKeys));
  createReadRecordTest('an FCGI_GET_VALUES_RESULT (empty)', 1, new fastcgi.records.GetValuesResult());
  createReadRecordTest('an FCGI_GET_VALUES_RESULT (small name/value pairs)', 1, new fastcgi.records.GetValuesResult(common.fixtures.smallParams));
  createReadRecordTest('an FCGI_GET_VALUES_RESULT (large name/value pairs)', 1, new fastcgi.records.GetValuesResult(common.fixtures.largeParams));
  createReadRecordTest('an FCGI_UNKNOWN_TYPE', 1, new fastcgi.records.UnknownType(common.fixtures.largeByte));
});

describe('FastCGIStream reading (multiple records)', function() {
  createMultiReadRecordTest('an FCGI_BEGIN_REQUEST', function() { return new fastcgi.records.BeginRequest(fastcgi.records.BeginRequest.roles.Responder, 254); });
  createMultiReadRecordTest('an FCGI_ABORT_REQUEST', function() { return new fastcgi.records.AbortRequest(); });
  createMultiReadRecordTest('an FCGI_END_REQUEST', function() { return new fastcgi.records.EndRequest(4294967295, 254); });
  createMultiReadRecordTest('an FCGI_PARAMS (empty)', function() { return new fastcgi.records.Params(); });
  createMultiReadRecordTest('an FCGI_PARAMS (small name/value pairs)', function() { return new fastcgi.records.Params(common.fixtures.smallParams); });
  createMultiReadRecordTest('an FCGI_PARAMS (large name/value pairs)', function() { return new fastcgi.records.Params(common.fixtures.largeParams); });
  createMultiReadRecordTest('an FCGI_STDIN (empty)', function() { return new fastcgi.records.StdIn(); });
  createMultiReadRecordTest('an FCGI_STDIN (string)', function() { return new fastcgi.records.StdIn(common.fixtures.basicString); });
  createMultiReadRecordTest('an FCGI_STDIN (unicode string)', function() { return new fastcgi.records.StdIn(common.fixtures.unicodeString); });
  createMultiReadRecordTest('an FCGI_STDIN (buffer)', function() { return new fastcgi.records.StdIn(common.createDummyBuffer()); });
  createMultiReadRecordTest('an FCGI_STDOUT (empty)', function() { return new fastcgi.records.StdOut(); });
  createMultiReadRecordTest('an FCGI_STDOUT (string)', function() { return new fastcgi.records.StdOut(common.fixtures.basicString); });
  createMultiReadRecordTest('an FCGI_STDOUT (unicode string)', function() { return new fastcgi.records.StdOut(common.fixtures.unicodeString); });
  createMultiReadRecordTest('an FCGI_STDOUT (buffer)', function() { return new fastcgi.records.StdOut(common.createDummyBuffer()); });
  createMultiReadRecordTest('an FCGI_STDERR (empty)', function() { return new fastcgi.records.StdErr(); });
  createMultiReadRecordTest('an FCGI_STDERR (string)', function() { return new fastcgi.records.StdErr(common.fixtures.basicString); });
  createMultiReadRecordTest('an FCGI_STDERR (unicode string)', function() { return new fastcgi.records.StdErr(common.fixtures.unicodeString); });
  createMultiReadRecordTest('an FCGI_STDERR (buffer)', function() { return new fastcgi.records.StdErr(common.createDummyBuffer()); });
  createMultiReadRecordTest('an FCGI_DATA (empty)', function() { return new fastcgi.records.Data(); });
  createMultiReadRecordTest('an FCGI_DATA (string)', function() { return new fastcgi.records.Data(common.fixtures.basicString); });
  createMultiReadRecordTest('an FCGI_DATA (unicode string)', function() { return new fastcgi.records.Data(common.fixtures.unicodeString); });
  createMultiReadRecordTest('an FCGI_DATA (buffer)', function() { return new fastcgi.records.Data(common.createDummyBuffer()); });
  createMultiReadRecordTest('an FCGI_GET_VALUES (empty)', function() { return new fastcgi.records.GetValues(); });
  createMultiReadRecordTest('an FCGI_GET_VALUES (small name/value pairs)', function() { return new fastcgi.records.GetValues(common.fixtures.smallKeys); });
  createMultiReadRecordTest('an FCGI_GET_VALUES (large name/value pairs)', function() { return new fastcgi.records.GetValues(common.fixtures.largeKeys); });
  createMultiReadRecordTest('an FCGI_GET_VALUES_RESULT (empty)', function() { return new fastcgi.records.GetValuesResult(); });
  createMultiReadRecordTest('an FCGI_GET_VALUES_RESULT (small name/value pairs)', function() { return new fastcgi.records.GetValuesResult(common.fixtures.smallParams); });
  createMultiReadRecordTest('an FCGI_GET_VALUES_RESULT (large name/value pairs)', function() { return new fastcgi.records.GetValuesResult(common.fixtures.largeParams); });
  createMultiReadRecordTest('an FCGI_UNKNOWN_TYPE', function() { return new fastcgi.records.UnknownType(common.fixtures.largeByte); });
});
