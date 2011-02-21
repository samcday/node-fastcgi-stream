var common = require("./common");

var GetValuesResult = module.exports = function(result) {
	this.result = result || [];

	this.getSize = function() {
		return common.calculateNameValuePairsLength(this.result);
	};
	
	this.write = function(buffer) {
		common.writeNameValuePairs(buffer, this.result);
	};
	
	this.read = function(buffer) {
		this.result = common.readNameValuePairs(buffer);
	};
};
GetValuesResult.prototype.TYPE = GetValuesResult.TYPE = 10;