var util = require("util"),
	events = require("events"),
	constants = require("./constants"),
	bufferUtils = require("./buffer_utils.js");

// Given that javascript is single threaded, we can safely allocate a write buffer for all streams, even if there's several at once.
// This buffer is pre-allocated to the absolute maximum size a FCGI record can be, which is the size of the header, that max size of record body,
// and the max size of padding.
var buffer = new Buffer(constants.HEADER_SIZE + constants.MAX_CONTENT_SIZE + constants.MAX_PADDING_SIZE);

var FastCGIStream = module.exports = function(stream) {
	this.writeRecord = function(requestId, record) {
		var recordBodyLength = record.getSize();
		var paddingLength = recordBodyLength % 8; // Align the record to an 8 byte boundary.

		buffer[0] = constants.VERSION;
		buffer[1] = record.TYPE;
		bufferUtils.setInt16(buffer, 2, requestId);
		bufferUtils.setInt16(buffer, 4, recordBodyLength);
		
		buffer[6] = paddingLength;
		buffer[7] = 0;

		if(recordBodyLength) record.write(buffer.slice(8, 8 + recordBodyLength + paddingLength));
		
		stream.write(buffer.slice(0, 8 + recordBodyLength + paddingLength));
	};
};
util.inherits(FastCGIStream, events.EventEmitter);
