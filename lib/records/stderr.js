var StdErr = module.exports = function() {
	
};
require("util").inherits(StdErr, require("./record"));
StdErr.prototype.TYPE = 7;