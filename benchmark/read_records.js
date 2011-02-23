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
		//chunkSize: num * (testRecord.getSize() + 8)
	});
	
	var fastcgiStream = new fastcgi.FastCGIStream(new DuplexStream(readStream, writeStream));
	
	for(var i = 0; i < num; i++) {
		fastcgiStream.writeRecord(i+1, constructor());
	}
	
	console.log('starting');
	var done = 0;
	var startTime = null;
	
	readStream.pause();
	readStream.put(writeStream.getContents());

	profiler.resume(profiler.CPU, profiler.HEAP_STATS, profiler.HEAP_SNAPSHOT, profiler.JS_CONSTRUCTORS);
	fastcgiStream.on("record", function() {
		done++;
		if(done == num) {
			profiler.pause();
			var totalTime = Date.now() - startTime;
			console.log("Read " + done + " records in " + totalTime + "ms");
			console.log("This is " + (done / (totalTime / 1000)) + " records per second.");
			readStream.pause();
		}
	});

	readStream.resume();
	startTime = Date.now();
};

runTest(function() { return new fastcgi.records.BeginRequest(112312313, 123) }, 5000);
//var myParams = [["LOLOLOLOLOL", "HAHAHAHA"], ["LOLOLOLOLOL", "HAHAHAHA"], ["LOLOLOLOLOL", "HAHAHAHA"], ["LOLOLOLOLOL", "HAHAHAHA"], ["LOLOLOLOLOL", "HAHAHAHA"]];
//runTest(function() { return new fastcgi.records.Params(myParams); }, 10000);