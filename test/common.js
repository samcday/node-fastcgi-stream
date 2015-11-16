'use strict';

var DuplexStream = require('duplex-stream');
var fastcgi = require('../lib/');
var streamBuffers = require('stream-buffers');

exports.createFCGIStream = function(chunkSize) {
  var readableStream = new streamBuffers.ReadableStreamBuffer({
    chunkSize: chunkSize || streamBuffers.DEFAULT_CHUNK_SIZE
  });
  var writableStream = new streamBuffers.WritableStreamBuffer();
  
  var fcgiStream = new fastcgi.FastCGIStream(new DuplexStream(readableStream, writableStream));
  fcgiStream._readableStream = readableStream;
  fcgiStream._writableStream = writableStream;
  
  return fcgiStream;
};

exports.createDummyBuffer = function() {
  var dummyBuffer = new Buffer(1025);
  for(var i = 0, len = dummyBuffer.length; i < len; i++) {
    dummyBuffer[i] = Math.floor(Math.random() * 255 + 1);
  }
  
  return dummyBuffer;
};

exports.fixtures = {
  largeByte: 254,
  largeShort: 0xFFFF,
  largeInt32: 4294967295,
  smallParams: [['Test', 'Value'], ['AnotherTest', 'AnotherValue']],
  largeParams: [['ThisIsAReallyLongHeaderNameItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah', 'ThisIsAReallyLongHeaderValueItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah'], ['AnotherTest', 'AnotherValue']],
  smallUnicodeParams: [['Параметр', 'Значение']],
  largeUnicodeParams: [['Параметр', 'Очень-очень-длинное-значение-которое-явно-больше-ста-двадцати-семи-байт-в-длину']],
  smallKeys: ['Test', 'Value', 'AnotherTest', 'AnotherValue'],
  largeKeys: ['ThisIsAReallyLongHeaderNameItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah', 'ThisIsAReallyLongHeaderValueItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah', 'AnotherTest', 'AnotherValue'],
  basicString: 'Basic String',
  unicodeString: '\u00bd + \u00bc = \u00be'
};
