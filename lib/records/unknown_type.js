var UnknownType = module.exports = function() {
	
};
require("util").inherits(UnknownType, require("./record"));
UnknownType.prototype.TYPE = 11;