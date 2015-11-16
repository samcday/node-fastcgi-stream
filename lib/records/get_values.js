'use strict';

var common = require('./common');

var GetValues = module.exports = function GetValues(values) {
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
GetValues.prototype.TYPE = GetValues.TYPE = 9;