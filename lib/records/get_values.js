var common = require("./common");

var GetValues = module.exports = function(values) {
	this.values = values || [];

	this.getSize = function() {
		return common.calculateNameValuePairsLength(this.values);
	};
	
	this.write = function(buffer) {
		common.writeNameValuePairs(buffer, this.values);
	};
};
GetValues.prototype.TYPE = GetValues.TYPE = 9;