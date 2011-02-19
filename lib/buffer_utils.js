// Some quick extensions to Buffer. Primarily adding methods to read/write data in network byte ordering (big endian).
module.exports = {
	getInt16: function(buffer, offset) {
		return buffer[offset] << 8 | buffer[offset + 1];
	},
	
	getInt32: function(buffer, offset) {
		return (buffer[offset] << 24) | (buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | (buffer[offset + 3] << 24);
	},
	
	setInt16: function(buffer, offset, val) {
		buffer[offset] = (val & 0xFF00) >> 8;
		buffer[offset + 1] = val;
	},
	
	setInt32: function(buffer, offset, val) {
		buffer[offset] = (val & 0xFF000000) >> 24;
		buffer[offset + 1] = (val & 0xFF0000) >> 16;
		buffer[offset + 2] = (val & 0xFF00) >> 8;
		buffer[offset + 3] = val;
	}
};
