'use strict';

var BufferList = require('bufferlist').BufferList;
var bufferUtils = require('./buffer_utils.js');
var constants = require('./constants');
var events = require('events');
var records = require('./records');
var util = require('util');

// Lookup table for FCGI records.
var fcgiRecords = {};
fcgiRecords[records.BeginRequest.TYPE] = records.BeginRequest;
fcgiRecords[records.AbortRequest.TYPE] = records.AbortRequest;
fcgiRecords[records.EndRequest.TYPE] = records.EndRequest;
fcgiRecords[records.Params.TYPE] = records.Params;
fcgiRecords[records.StdIn.TYPE] = records.StdIn;
fcgiRecords[records.StdOut.TYPE] = records.StdOut;
fcgiRecords[records.StdErr.TYPE] = records.StdErr;
fcgiRecords[records.Data.TYPE] = records.Data;
fcgiRecords[records.GetValues.TYPE] = records.GetValues;
fcgiRecords[records.GetValuesResult.TYPE] = records.GetValuesResult;
fcgiRecords[records.UnknownType.TYPE] = records.UnknownType;

// TODO: need to figure out an effective way to deal with incoming data. I would like to allocate a read buffer with maximum record length just like I do for the 
// write buffer, however I don't think this is feasible, given that even 100 active streams would be 6.5mb in memory. For now just to get things running I'm going to 
// allocate a buffer the size of the record body every time a record comes in. I'm thinking the best bet might be to have a pool of Buffers allocated when the module first
// boots up. Then I can setup a very lightweight pool manager to dish out Buffers when they're requested for incoming records. With this approach I'd then have to write some
// contingency code for peak load, increasing the Buffer pool as necessary... Although this might actually be an idea for another library - a generic pool manager that responds to
// higher load by allocating more resources in the Buffer, then deallocating them when all is quiet... But I digress.
var FastCGIStream = module.exports = function(stream) {
  var that = this;
  var bufferList = new BufferList();

  // These variables are used for an incoming record.
  var type = 0, requestId = 0, contentLength = 0, paddingLength = 0;

  var processIncomingData = function() {
    // There are two different states we can be in.

    while(bufferList.length) {
      // We don't have shit, and we're waiting for a record header.
      if(bufferList.length >= 8 && !type) {
        var headerData = bufferList.take(8);
        bufferList.advance(8);
  
        type = headerData[1];
        requestId = bufferUtils.getInt16(headerData, 2);
        contentLength = bufferUtils.getInt16(headerData, 4);
        paddingLength = headerData[6];
      }
      
      // We have record header and we're waiting for record body.
      if(type && (bufferList.length >= (contentLength + paddingLength))) {
        var record = new fcgiRecords[type];
        if(contentLength) {
          var body = bufferList.take(contentLength);
          record.read(body);  
          bufferList.advance(contentLength);
        }
  
        if(paddingLength) {
          bufferList.advance(paddingLength);
        }
  
        that.emit('record', requestId, record);
        
        // If there's no padding for us to handle, then let's reset state for another record.
        type = 0;
        requestId = 0;
        contentLength = 0;
        paddingLength = 0;
      }
      else {
        return;
      }
    }
  };

  stream.on('data', function(data) {
    bufferList.push(data);
    
    processIncomingData();
  });

  this.writeRecord = function(requestId, record, callback) {
    var recordBodyLength = record.getSize();
    var paddingLength = recordBodyLength % 8; // Align the record to an 8 byte boundary.
    var fullLength = 8 + recordBodyLength + paddingLength;

    /* Allocate a new buffer, since stream.write() will hold the pointer to the buffer
     * until the operation finishes, which may not occur immediately.
     */
    var writeBuffer = new Buffer(fullLength);

    writeBuffer[0] = constants.VERSION;
    writeBuffer[1] = record.TYPE;
    bufferUtils.setInt16(writeBuffer, 2, requestId);
    bufferUtils.setInt16(writeBuffer, 4, recordBodyLength);
    
    writeBuffer[6] = paddingLength;
    writeBuffer[7] = 0;

    if(recordBodyLength) record.write(writeBuffer.slice(8, fullLength));
    
    return stream.write(writeBuffer, callback);
  };
};
util.inherits(FastCGIStream, events.EventEmitter);
