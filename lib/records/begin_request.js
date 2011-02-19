var bufferUtils = require("../buffer_utils");

var BeginRequest = module.exports = function(role, flags) {
	this.role = role;
	this.flags = flags;

	this.getSize = function() {
		return 8;
	};

	this.write = function(buffer) {
		bufferUtils.setInt16(buffer, 0, this.role);
		bufferUtils[2] = this.flags;
	};
};
require("util").inherits(BeginRequest, require("./record"));
BeginRequest.prototype.TYPE = 1;
