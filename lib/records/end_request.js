var bufferUtils = require("../buffer_utils");

var EndRequest = module.exports = function(appStatus, protocolStatus) {
	this.appStatus = appStatus || 0;
	this.protocolStatus = protocolStatus || 0;

	this.getSize = function() {
		return 8;
	};
	
	this.write = function(buffer) {
		bufferUtils.setInt32(buffer, 0, this.appStatus);
		buffer[4] = this.protocolStatus;
	};
	
	this.read = function(buffer) {
		this.appStatus = bufferUtils.getInt32(buffer, 0);
		this.protocolStatus = buffer[4];
	};
};
EndRequest.prototype.TYPE = EndRequest.TYPE = 3;

EndRequest.protocolStatus = {
	REQUEST_COMPLETE: 0,
	CANT_MPX_CONN: 1,
	OVERLOADED: 2,
	UNKNOWN_ROLE: 3
};