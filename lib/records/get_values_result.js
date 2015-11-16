'use strict';

var common = require('./common');

var GetValuesResult = module.exports = function GetValuesResult(values) {
  this.values = values || [];

  this.getSize = function() {
    return common.calculateNameValuePairsLength(this.values);
  };
  
  this.write = function(buffer) {
    common.writeNameValuePairs(buffer, this.values);
  };
  
  this.read = function(buffer) {
    this.values = common.readNameValuePairs(buffer);
  };
};
GetValuesResult.prototype.TYPE = GetValuesResult.TYPE = 10;