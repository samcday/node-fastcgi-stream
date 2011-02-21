var UnknownType = module.exports = function(type) {
	this.type = type || 0;
	
	this.getSize = function() {
		return 8;
	};
	
	this.write = function(buffer) {
		buffer[0] = this.type;
	};
	
	this.read = function(buffer) {
		this.type = buffer[0];
	};
};
UnknownType.prototype.TYPE = UnknownType.TYPE = 11;