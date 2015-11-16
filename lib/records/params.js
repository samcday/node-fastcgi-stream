'use strict';

var common = require('./common');

var Params = module.exports = function Params(params) {
  this.params = params || [];
  
  this.getSize = function() {
    return common.calculateNameValuePairsLength(this.params);
  };
  
  this.write = function(buffer) {
    common.writeNameValuePairs(buffer, this.params);
  };
  
  this.read = function(buffer) {
    this.params = common.readNameValuePairs(buffer);
  };
};
Params.prototype.TYPE = Params.TYPE = 4;