/* eslint no-console:0 */

'use strict';

var DuplexStream = require('duplex-stream');
var fastcgi = require('../lib');
var streamBuffers = require('stream-buffers');

var runTest = function(constructor, num) {
  num = num || 1000;

  // Make a write buffer big enough to fit everything.
  var writeStream = new streamBuffers.WritableStreamBuffer({
  });
  
  var readStream = new streamBuffers.ReadableStreamBuffer();
  
  var fastcgiStream = new fastcgi.FastCGIStream(new DuplexStream(readStream, writeStream));
  
  for(var i = 0; i < num; i++) {
    fastcgiStream.writeRecord(i+1, constructor());
  }
  
  console.log('starting');
  var running = true;
  var iter = 0;
  
  readStream.pause();
  readStream.put(writeStream.getContents());
  
  fastcgiStream.on('record', function() {
    if(running) iter++;
  });
  
  setTimeout(function() {
    running = false;
    
    console.log('Read ' + iter + ' records.');
    readStream.pause();
  }, 1000);

  readStream.resume();
};

//runTest(function() { return new fastcgi.records.BeginRequest(Math.floor(Math.random()*300000 + 1), Math.floor(Math.random()*255 + 1)); }, 20000);
var myParams = [['LOLOLOLOLOL', 'HAHAHAHA'], ['LOLOLOLOLOL', 'HAHAHAHA'], ['LOLOLOLOLOL', 'HAHAHAHA'], ['LOLOLOLOLOL', 'HAHAHAHA'], ['LOLOLOLOLOL', 'HAHAHAHA']];
runTest(function() { return new fastcgi.records.Params(myParams); }, 10000);