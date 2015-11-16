'use strict';

var bufferUtils = require('../lib/buffer_utils.js');
var common = require('./common');
var expect = require('chai').expect;
var fastcgi = require('../lib/');

var createWriteRecordTest = function(desc, record) {
  var requestId = Math.floor(Math.random() * 65535 + 1);

  describe(desc, function() {
    before(function() {
      this.fcgiStream = common.createFCGIStream();
      this.fcgiStream.writeRecord(requestId, record);
    });
    
    it('writes at least 8 bytes', function() {
      expect(this.fcgiStream._writableStream.size()).to.be.at.least(8);
    });

    it('<parse header>', function() {
      this.header = this.fcgiStream._writableStream.getContents(8);
      this.contentLength = bufferUtils.getInt16(this.header, 4);
      this.paddingLength = this.header[6];
    });

    describe('header', function() {
      it('has correct version', function() {
        expect(this.header[0]).to.eql(1);
      });
      
      it('has correct type', function() {
        expect(this.header[1]).to.eql(record.TYPE);
      });

      it('has correct requestId', function() {
        expect(bufferUtils.getInt16(this.header, 2)).to.eql(requestId);
      });

      it('body size matches record calculation', function() {
        expect(this.contentLength).to.eql(record.getSize());
      });

      it('body and padding are correct length', function() {
        expect(this.fcgiStream._writableStream.size()).to.eql(this.contentLength + this.paddingLength); 
      });

      it('padding is correct length', function() {
        expect(this.paddingLength).to.eql(this.contentLength % 8); 
      });
    });

    if(record.getSize()) {
      describe('the body', function() {
        createRecordBodyTests(record);
      });
    }
  });
};

function createRecordBodyTests(record) {
  before(function() {
    this.body = this.fcgiStream._writableStream.getContents(this.contentLength);
  });

  switch(record.TYPE) {
    case fastcgi.records.BeginRequest.TYPE: {
      it('role is correct', function() {
        expect(bufferUtils.getInt16(this.body, 0)).to.eql(record.role);
      });
      
      it('flags are correct', function() {
        expect(this.body[2]).to.eql(record.flags);
      });

      break;
    }
    case fastcgi.records.EndRequest.TYPE: {
      it('appStatus is correct', function() {
        expect(bufferUtils.getInt32(this.body, 0)).to.eql(record.appStatus);
      });
      
      it('protocolStatus is correct', function() {
        expect(this.body[4]).to.eql(record.protocolStatus);       
      });

      break;
    }
    case fastcgi.records.Params.TYPE:
    case fastcgi.records.GetValues.TYPE: 
    case fastcgi.records.GetValuesResult.TYPE: {
      var theParams = record.params || record.values || record.result;

      // Calculate size for each name/value pair, including the length preambles.
      var totalSize = 0;
      var paramOffsets = [];
      var pairSizes = theParams.map(function(param) {
        if(!Array.isArray(param)) param = [param, ''];
        
        var offset = totalSize;
        var keySize, valueSize, paramSize = 0;
        var lengths = param.map(function (element) {
          return Buffer.byteLength(element);
        });
        paramSize += (lengths[0] > 127) ? 4 : 1;
        paramSize += (lengths[1] > 127) ? 4 : 1;
        keySize = lengths[0];
        valueSize = lengths[1];
        
        paramSize += keySize + valueSize;
        paramOffsets.push({start: offset, end: offset + paramSize});
        totalSize += paramSize;

        return {keySize: keySize, valueSize: valueSize};
      });

      it('overall length is correct', function() {
        expect(this.body.length).to.eql(totalSize);
      });

      theParams.forEach(function(param, index) {
        if(!Array.isArray(param)) param = [param, ''];

        describe('param *' + param[0] + '*', function() {
          before(function() {
            var offset = paramOffsets[index];
            this.paramBuffer = this.body.slice(offset.start, offset.end);
          });

          it('key length is correct', function() {
            if(pairSizes[index].keySize > 127) {
              expect(bufferUtils.getInt32(this.paramBuffer, 0)).to.eql(pairSizes[index].keySize + 2147483648);
            }
            else {
              expect(this.paramBuffer[0]).to.eql(pairSizes[index].keySize);
            }
          });

          it('value length is correct', function() {
            var offset = (pairSizes[index].keySize > 127) ? 4 : 1;

            if(pairSizes[index].valueSize > 127) {
              expect(bufferUtils.getInt32(this.paramBuffer, offset)).to.eql(pairSizes[index].valueSize + 2147483648);
            }
            else {
              expect(this.paramBuffer[offset]).to.eql(pairSizes[index].valueSize);
            }
          });

          it('key is correct', function() {
            var offset = ((pairSizes[index].keySize > 127) ? 4 : 1) + ((pairSizes[index].valueSize > 127) ? 4 : 1);
            expect(this.paramBuffer.toString('utf8', offset, pairSizes[index].keySize + offset)).to.eql(param[0]);
          });

          it('value is correct', function() {
            var offset = ((pairSizes[index].keySize > 127) ? 4 : 1) + ((pairSizes[index].valueSize > 127) ? 4 : 1);
            expect(this.paramBuffer.toString('utf8', pairSizes[index].keySize + offset)).to.eql(param[1]);
          });
        });
      });
      
      break;
    }
    case fastcgi.records.Data.TYPE: 
    case fastcgi.records.StdIn.TYPE:
    case fastcgi.records.StdOut.TYPE:
    case fastcgi.records.StdErr.TYPE: {
      it('body data is correct', function() {
        var dataAsBuffer = Buffer.isBuffer(record.data) ? record.data : new Buffer(record.data); 
        for(var i = 0; i < dataAsBuffer.length; i++) {
          expect(this.body[i]).to.eql(dataAsBuffer[i], 'Data at index #' + i + ' does not match.');
        }
      });

      break;
    }
    case fastcgi.records.UnknownType.TYPE: {
      it('type is correct', function() {
        expect(this.body[0]).to.eql(record.type);
      });
      
      break;
    }
  }
}

describe('FastCGIStream writing', function() {
  createWriteRecordTest('an FCGI_BEGIN_REQUEST', new fastcgi.records.BeginRequest(common.fixtures.largeShort, common.fixtures.largeByte));
  createWriteRecordTest('an FCGI_ABORT_REQUEST', new fastcgi.records.AbortRequest());
  createWriteRecordTest('an FCGI_END_REQUEST', new fastcgi.records.EndRequest(common.fixtures.largeInt32, common.fixtures.largeByte));
  createWriteRecordTest('an FCGI_PARAMS (empty)', new fastcgi.records.Params());
  createWriteRecordTest('an FCGI_PARAMS (small name/value pairs)', new fastcgi.records.Params(common.fixtures.smallParams));
  createWriteRecordTest('an FCGI_PARAMS (large name/value pairs)', new fastcgi.records.Params(common.fixtures.largeParams));
  createWriteRecordTest('an FCGI_PARAMS (small unicode name/value pairs)', new fastcgi.records.Params(common.fixtures.smallUnicodeParams));
  createWriteRecordTest('an FCGI_PARAMS (large unicode name/value pairs)', new fastcgi.records.Params(common.fixtures.largeUnicodeParams));
  createWriteRecordTest('an FCGI_STDIN (empty)', new fastcgi.records.StdIn());
  createWriteRecordTest('an FCGI_STDIN (string)', new fastcgi.records.StdIn(common.fixtures.basicString));
  createWriteRecordTest('an FCGI_STDIN (unicode string)', new fastcgi.records.StdIn(common.fixtures.unicodeString));
  createWriteRecordTest('an FCGI_STDIN (buffer)', new fastcgi.records.StdIn(common.createDummyBuffer()));
  createWriteRecordTest('an FCGI_STDOUT (empty)', new fastcgi.records.StdOut());
  createWriteRecordTest('an FCGI_STDOUT (string)', new fastcgi.records.StdOut(common.fixtures.basicString));
  createWriteRecordTest('an FCGI_STDOUT (unicode string)', new fastcgi.records.StdOut(common.fixtures.unicodeString));
  createWriteRecordTest('an FCGI_STDOUT (buffer)', new fastcgi.records.StdOut(common.createDummyBuffer()));
  createWriteRecordTest('an FCGI_STDERR (empty)', new fastcgi.records.StdErr());
  createWriteRecordTest('an FCGI_STDERR (string)', new fastcgi.records.StdErr(common.fixtures.basicString));
  createWriteRecordTest('an FCGI_STDERR (unicode string)', new fastcgi.records.StdErr(common.fixtures.unicodeString));
  createWriteRecordTest('an FCGI_STDERR (buffer)', new fastcgi.records.StdErr(common.createDummyBuffer()));
  createWriteRecordTest('an FCGI_DATA (empty)', new fastcgi.records.Data());
  createWriteRecordTest('an FCGI_DATA (string)', new fastcgi.records.Data(common.fixtures.basicString));
  createWriteRecordTest('an FCGI_DATA (unicode string)', new fastcgi.records.Data(common.fixtures.unicodeString));
  createWriteRecordTest('an FCGI_DATA (buffer)', new fastcgi.records.Data(common.createDummyBuffer()));
  createWriteRecordTest('an FCGI_GET_VALUES (empty)', new fastcgi.records.GetValues());
  createWriteRecordTest('an FCGI_GET_VALUES (small name/value pairs)', new fastcgi.records.GetValues(common.fixtures.smallKeys));
  createWriteRecordTest('an FCGI_GET_VALUES (large name/value pairs)', new fastcgi.records.GetValues(common.fixtures.largeKeys));
  createWriteRecordTest('an FCGI_GET_VALUES_RESULT (empty)', new fastcgi.records.GetValuesResult());
  createWriteRecordTest('an FCGI_GET_VALUES_RESULT (small name/value pairs)', new fastcgi.records.GetValuesResult(common.fixtures.smallParams));
  createWriteRecordTest('an FCGI_GET_VALUES_RESULT (large name/value pairs)', new fastcgi.records.GetValuesResult(common.fixtures.largeParams));
  createWriteRecordTest('an FCGI_UNKNOWN_TYPE', new fastcgi.records.UnknownType(common.fixtures.largeByte));
});
