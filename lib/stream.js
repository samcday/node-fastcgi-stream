var util = require("util"),
	events = require("events"),
	constants = require("./constants");

var FastCGIStream = module.exports = function(stream) {
	var buffer = new Buffer(constants.HEADER_SIZE + MAX_CONTENT_SIZE + MAX_PADDING_SIZE);
	
	this.writeRecord = function(requestId, record) {
		
	};
};
util.inherits(FastCGIStream, events.EventEmitter);
