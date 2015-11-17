// Some common functionality shared amongst record types.

/* jshint bitwise: true */

'use strict';

var bufferUtils = require('../buffer_utils');

function getPairLengths(pair) {
  return pair.map(function (element) {
    return Buffer.byteLength(element);
  });
}

exports.calculateNameValuePairsLength = function(pairs) {
  var size = 0;
  
  pairs.forEach(function(pair) {
    if(!Array.isArray(pair)) {
      pair = [pair, ''];
    }

    var lengths = getPairLengths(pair);
    size += lengths[0];
    size += lengths[1];
    size += (lengths[0] > 127) ? 4 : 1;
    size += (lengths[1] > 127) ? 4 : 1;
  });
  
  return size;
};
  
exports.writeNameValuePairs = function(buffer, pairs) {
  var index = 0;
  pairs.forEach(function(pair) {
    if(!Array.isArray(pair)) {
      pair = [pair, ''];
    }

    var lengths = getPairLengths(pair);

    if(lengths[0] > 127) {
      bufferUtils.setInt32(buffer, index, lengths[0]+ 2147483648);
      index += 4;
    }
    else {
      buffer[index++] = lengths[0];
    }

    if(lengths[1]> 127) {
      bufferUtils.setInt32(buffer, index, lengths[1]+ 2147483648);
      index += 4;
    }
    else {
      buffer[index++] = lengths[1];
    }
    
    buffer.write(pair[0], index);
    index += lengths[0];
    buffer.write(pair[1], index);
    index += lengths[1];
  });
};

function readLength(buffer, offset) {
  var length = buffer[offset++];
  if(length & 0x80) {
    length = ((length - 128) << 24) | (buffer[offset++] << 16) | (buffer[offset++] << 8) | buffer[offset++];
  }
  return [length, offset];
}

exports.readNameValuePairs = function(buffer) {
  var offset = 0, len = buffer.length, pairs = [], keyLength, valueLength, key, value;
  
  while(offset < len) {
    var result = readLength(buffer, offset);
    keyLength = result[0];
    offset = result[1];

    result = readLength(buffer, offset);
    valueLength = result[0];
    offset = result[1];

    key = buffer.toString('utf8', offset, offset + keyLength);
    offset += keyLength;
    if(valueLength) {
      value = buffer.toString('utf8', offset, offset + valueLength);
      offset += valueLength;
    }

    pairs.push(valueLength ? [key, value] : key);
  }

  return pairs;
};
