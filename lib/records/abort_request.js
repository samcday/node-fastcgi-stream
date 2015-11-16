'use strict';

var AbortRequest = module.exports = function AbortRequest() {
  this.getSize = function() {
    return 0;
  };
};
AbortRequest.prototype.TYPE = AbortRequest.TYPE = 2;