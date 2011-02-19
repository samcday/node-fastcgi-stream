var common = require("./common");

var GetValuesResult = module.exports = function(result) {
	this.result = result || [];

	this.getSize = function() {
		return common.calculateNameValuePairsLength(this.result);
	};
	
	this.write = function(buffer) {
		common.writeNameValuePairs(buffer, this.result);
	};
};
GetValuesResult.prototype.TYPE = GetValuesResult.TYPE = 10;