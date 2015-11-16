/* eslint no-console:0 */

'use strict';

var streamBuffers = require('stream-buffers');
var fastcgi = require('../lib');

var createRecords = function(constructor, num) {
  num = num || 1000;

  // Make a write buffer big enough to fit everything.
  var writeStream = new streamBuffers.WritableStreamBuffer({
  });
  
  var fastcgiStream = new fastcgi.FastCGIStream(writeStream);
  
  var start = Date.now();
  var running = true;
  var i = 1;

  setTimeout(function() {
    running = false;
    console.log('Took ' + (Date.now() - start) + 'ms to write ' + i + ' records');
    console.log('Buffer has ' + writeStream.size() + ' bytes.');
  }, 1000);
  
  var doWrite = function() {
    fastcgiStream.writeRecord(i++, constructor());
    if(running) process.nextTick(doWrite);
  };
  
  process.nextTick(doWrite);
};

//createRecords(function() { return new fastcgi.records.BeginRequest(Math.floor(Math.random()*300000 + 1), Math.floor(Math.random()*255 + 1)); }, 10000);
var myParams = [['LOLOLOLOLOL', 'HAHAHAHA'], ['LOLOLOLOLOL', 'HAHAHAHA'], ['LOLOLOLOLOL', 'HAHAHAHA'], ['LOLOLOLOLOL', 'HAHAHAHA'], ['LOLOLOLOLOL', 'HAHAHAHA']];
createRecords(function() { return new fastcgi.records.Params(myParams); }, 10000);
