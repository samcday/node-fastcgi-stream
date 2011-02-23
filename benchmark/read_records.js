var streamBuffers = require("stream-buffers"),
	fastcgi = require("../lib"),
	DuplexStream = require("duplex-stream"),
	profiler = require("profiler");

var runTest = function(constructor, num) {
	var testRecord = constructor();
	num = num || 1000;

	// Make a write buffer big enough to fit everything.
	var writeStream = new streamBuffers.WritableStreamBuffer({
	});
	
	var readStream = new streamBuffers.ReadableStreamBuffer({
		chunkSize: num * (testRecord.getSize() + 8)
	});
	
	var fastcgiStream = new fastcgi.FastCGIStream(new DuplexStream(readStream, writeStream));
	
	for(var i = 0; i < num; i++) {
		fastcgiStream.writeRecord(i+1, constructor());
	}
	
	console.log('starting');
	var running = true;
	var done = 0;
	
	readStream.pause();
	readStream.put(writeStream.getContents());

	profiler.resume(profiler.CPU, profiler.HEAP_STATS, profiler.HEAP_SNAPSHOT, profiler.JS_CONSTRUCTORS);
	fastcgiStream.on("record", function() {
		if(running) done++;
		if(done == num) return;
	});
	
	setTimeout(function() {
		running = false;
		
		//profiler.pause();
		console.log("Read " + done + " records.");
		readStream.pause();
	}, 1000);

	readStream.resume();
};

runTest(function() { return new fastcgi.records.BeginRequest(112312313, 123) }, 1000);
//var myParams = [["LOLOLOLOLOL", "HAHAHAHA"], ["LOLOLOLOLOL", "HAHAHAHA"], ["LOLOLOLOLOL", "HAHAHAHA"], ["LOLOLOLOLOL", "HAHAHAHA"], ["LOLOLOLOLOL", "HAHAHAHA"]];
//runTest(function() { return new fastcgi.records.Params(myParams); }, 10000);