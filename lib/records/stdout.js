var StdOut = module.exports = function() {
	
};
require("util").inherits(StdOut, require("./record"));
StdOut.prototype.TYPE = 6;