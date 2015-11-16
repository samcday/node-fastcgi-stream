'use strict';

var StdIn = module.exports = function StdIn(data) {
  this.data = data || '';

  this.getSize = function() {
    return Buffer.isBuffer(this.data) ? this.data.length : Buffer.byteLength(this.data);
  };
  
  this.write = function(buffer) {
    if(this.data) {
      if(Buffer.isBuffer(this.data)) {
        this.data.copy(buffer);
      }
      else {
        buffer.write(this.data, 0, this.encoding || 'utf8');
      }
    }
  };
  
  this.read = function(buffer) {
    if(this.encoding) {
      this.data = buffer.toString(this.encoding);
    }
    else {
      this.data = new Buffer(buffer.length);
      buffer.copy(this.data);
    }
  };
};
StdIn.prototype.TYPE = StdIn.TYPE = 5;
