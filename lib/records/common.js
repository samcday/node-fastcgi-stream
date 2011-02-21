var bufferUtils = require("../buffer_utils");

// Some common functionality shared amongst record types.
module.exports = {
	calculateNameValuePairsLength: function(pairs) {
		var size = 0;
		
		pairs.forEach(function(pair) {
			if(!Array.isArray(pair)) {
				pair = [pair, ""];
			}

			size += pair[0].length;
			size += pair[1].length;
			size += (pair[0].length > 127) ? 4 : 1;
			size += (pair[1].length > 127) ? 4 : 1;
		});
		
		return size;
	},
	
	writeNameValuePairs: function(buffer, pairs) {
		var index = 0;
		pairs.forEach(function(pair) {
			if(!Array.isArray(pair)) {
				pair = [pair, ""];
			}

			if(pair[0].length > 127) {
				bufferUtils.setInt32(buffer, index, pair[0].length + 2147483648);
				index += 4;
			}
			else {
				buffer[index++] = pair[0].length;
			}

			if(pair[1].length > 127) {
				bufferUtils.setInt32(buffer, index, pair[1].length + 2147483648);
				index += 4;
			}
			else {
				buffer[index++] = pair[1].length;
			}
			
			buffer.write(pair[0], index);
			index += pair[0].length;
			buffer.write(pair[1], index);
			index += pair[1].length;
		});
	},
	
	readNameValuePairs: function(buffer) {
		var offset = 0, len = buffer.length, pairs = [], pair, keyLength, valueLength, key, value;
		
		while(offset < len) {
			keyLength = buffer[offset++];
			if(keyLength & 0x80) {
				keyLength = ((keyLength - 128) << 24) | (buffer[offset++] << 16) | (buffer[offset++] << 8) | buffer[offset++];
			}
			
			valueLength = buffer[offset++];
			if(valueLength & 0x80) {
				valueLength = ((valueLength - 128) << 24) | (buffer[offset++] << 16) | (buffer[offset++] << 8) | buffer[offset++];
			}
			
			key = buffer.toString("utf8", offset, offset + keyLength);
			offset += keyLength;
			if(valueLength) {
				value = buffer.toString("utf8", offset, offset + valueLength);
				offset += valueLength;
			}
			
			if(valueLength) {
				pairs.push([key, value]);
			}
			else
				pairs.push(key);
		}
		
		return pairs;
	}
};