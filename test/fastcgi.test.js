var vows = require("vows"),
	assert = require("assert"),
	fastcgi = require("../lib/"),
	streamBuffers = require("stream-buffers"),
	DuplexStream = require("duplex-stream"),
	bufferUtils = require("../lib/buffer_utils.js");

var createRecordSanityChecks = function(opts) {
	var context = {
		topic: function() {
			var record = new opts.class();

			if(opts.values) {
				Object.keys(opts.values).forEach(function(valueName) {
					record[valueName] = opts.values[valueName];
				});
			}

			return record;
		}
	};
	
	if(opts.expectedSize !== undefined) {
		context["record calculates its size correctly"] = function(record) {
			assert.equal(record.getSize(), opts.expectedSize);
		};
	};
	
	if(opts.expectedType) {
		context["record has correct type"] = function(record) {
			assert.equal(record.TYPE, opts.expectedType);
		};

		context["record constructor has correct type"] = function() {
			assert.equal(opts.class.TYPE, opts.expectedType);
		};
	}

	return context;
};

vows.describe("FastCGIStream Sanity Checks").addBatch({
	"BeginRequest": createRecordSanityChecks({
		class: fastcgi.records.BeginRequest,
		expectedSize: 8,
		expectedType: 1
	}),
	
	"AbortRequest": createRecordSanityChecks({
		class: fastcgi.records.AbortRequest,
		expectedSize: 0,
		expectedType: 2
	}),
	
	"EndRequest": createRecordSanityChecks({
		class: fastcgi.records.EndRequest,
		expectedSize: 8,
		expectedType: 3
	}),

	"Params (empty)": createRecordSanityChecks({
		class: fastcgi.records.Params,
		expectedSize: 0,
		expectedType: 4
	}),
	
	"Params (with values)": createRecordSanityChecks({
		class: fastcgi.records.Params,
		values: {
			params: [["Test", "Value"], ["AnotherTest", "AnotherValue"]]
		},
		expectedSize: 36
	}),
	
	"Params (with large values)": createRecordSanityChecks({
		class: fastcgi.records.Params,
		values: {
			params: [["Test", "Value"], ["ThisIsAReallyLongHeaderNameItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah", "ThisIsAReallyLongHeaderValueItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah"]]
		},
		expectedSize: 280
	}),
	
	"StdIn (no data)": createRecordSanityChecks({
		class: fastcgi.records.StdIn,
		expectedSize: 0,
		expectedType: 5
	}),
	
	"StdIn (basic string)": createRecordSanityChecks({
		class: fastcgi.records.StdIn,
		values: { data: "Hello" },
		expectedSize: 5
	}),
	
	"StdIn (unicode string)": createRecordSanityChecks({
		class: fastcgi.records.StdIn,
		values: { data: '\u00bd + \u00bc = \u00be' },
		expectedSize: 12
	}),
	
	"StdIn (buffer)": createRecordSanityChecks({
		class: fastcgi.records.StdIn,
		values: { data: new Buffer(10) },
		expectedSize: 10
	}),
	
	"StdOut (no data)": createRecordSanityChecks({
		class: fastcgi.records.StdOut,
		expectedSize: 0,
		expectedType: 6
	}),
	
	"StdOut (basic string)": createRecordSanityChecks({
		class: fastcgi.records.StdOut,
		values: { data: "Hello" },
		expectedSize: 5
	}),
	
	"StdOut (unicode string)": createRecordSanityChecks({
		class: fastcgi.records.StdOut,
		values: { data: '\u00bd + \u00bc = \u00be' },
		expectedSize: 12
	}),
	
	"StdOut (buffer)": createRecordSanityChecks({
		class: fastcgi.records.StdOut,
		values: { data: new Buffer(10) },
		expectedSize: 10
	}),
	
	"StdErr (no data)": createRecordSanityChecks({
		class: fastcgi.records.StdErr,
		expectedSize: 0,
		expectedType: 7
	}),
	
	"StdErr (basic string)": createRecordSanityChecks({
		class: fastcgi.records.StdErr,
		values: { data: "Hello" },
		expectedSize: 5
	}),
	
	"StdErr (unicode string)": createRecordSanityChecks({
		class: fastcgi.records.StdErr,
		values: { data: '\u00bd + \u00bc = \u00be' },
		expectedSize: 12
	}),
	
	"StdErr (buffer)": createRecordSanityChecks({
		class: fastcgi.records.StdErr,
		values: { data: new Buffer(10) },
		expectedSize: 10
	}),
	
	"Data (no data)": createRecordSanityChecks({
		class: fastcgi.records.Data,
		expectedSize: 0,
		expectedType: 8
	}),
	
	"Data (basic string)": createRecordSanityChecks({
		class: fastcgi.records.Data,
		values: { data: "Hello" },
		expectedSize: 5
	}),
	
	"Data (unicode string)": createRecordSanityChecks({
		class: fastcgi.records.Data,
		values: { data: '\u00bd + \u00bc = \u00be' },
		expectedSize: 12
	}),
	
	"Data (buffer)": createRecordSanityChecks({
		class: fastcgi.records.Data,
		values: { data: new Buffer(10) },
		expectedSize: 10
	}),
	
	"GetValues (empty)": createRecordSanityChecks({
		class: fastcgi.records.GetValues,
		expectedSize: 0,
		expectedType: 9
	}),
	
	"GetValues (with values)": createRecordSanityChecks({
		class: fastcgi.records.GetValues,
		values: {
			values: ["Test", "AnotherTest"]
		},
		expectedSize: 19
	}),
	
	"GetValues (with large values)": createRecordSanityChecks({
		class: fastcgi.records.GetValues,
		values: {
			values: ["Test", "ThisIsAReallyLongHeaderNameItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah"]
		},
		expectedSize: 141
	}),

	"GetValuesResult (empty)": createRecordSanityChecks({
		class: fastcgi.records.GetValuesResult,
		expectedSize: 0,
		expectedType: 10
	}),
	
	"GetValuesResult (with values)": createRecordSanityChecks({
		class: fastcgi.records.GetValuesResult,
		values: {
			result: [["Test", "Value"], ["AnotherTest", "AnotherValue"]]
		},
		expectedSize: 36
	}),
	
	"GetValuesResult (with large values)": createRecordSanityChecks({
		class: fastcgi.records.GetValuesResult,
		values: {
			result: [["Test", "Value"], ["ThisIsAReallyLongHeaderNameItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah", "ThisIsAReallyLongHeaderValueItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah"]]
		},
		expectedSize: 280
	}),
	
	"UnknownType": createRecordSanityChecks({
		class: fastcgi.records.UnknownType,
		expectedSize: 8,
		expectedType: 11
	})
}).export(module);


var createFCGIStream = function() {
	var readableStream = new streamBuffers.ReadableStreamBuffer();
	var writableStream = new streamBuffers.WritableStreamBuffer();
	
	var fcgiStream = new fastcgi.FastCGIStream(new DuplexStream(readableStream, writableStream));
	fcgiStream._readableStream = readableStream;
	fcgiStream._writableStream = writableStream;
	
	return fcgiStream;
};

var createRecordBodyTests = function(record, deferredContentLengthFn) {
	var tests = {
		topic: function(fcgiStream) {
			var body = fcgiStream._writableStream.getContents(deferredContentLengthFn());
			return body;
		}
	};

	switch(record.TYPE) {
		case fastcgi.records.BeginRequest.TYPE: {
			tests["role is correct"] = function(body) {
				assert.equal(bufferUtils.getInt16(body, 0), record.role);
			};
			
			tests["flags are correct"] = function(body) {
				assert.equal(body[2], record.flags);
			};
			
			return tests;
		}
		case fastcgi.records.EndRequest.TYPE: {
			tests["appStatus is correct"] = function(body) {
				assert.equal(bufferUtils.getInt32(body, 0), record.appStatus);
			};
			
			tests["protocolStatus is correct"] = function(body) {
				assert.equal(body[4], record.protocolStatus);				
			};
			
			return tests;
		}
		case fastcgi.records.Params.TYPE:
		case fastcgi.records.GetValues.TYPE: 
		case fastcgi.records.GetValuesResult.TYPE: {
			var theParams = record.params || record.values || record.result;

			// Calculate size for each name/value pair, including the length preambles.
			var totalSize = 0;
			var paramSizes = [];
			var pairSizes = theParams.map(function(param) {
				if(!Array.isArray(param)) param = [param, ""];
				
				var keySize, valueSize, paramSize = 0;

				paramSize += (param[0].length > 127) ? 4 : 1;
				paramSize += (param[1].length > 127) ? 4 : 1;
				keySize = param[0].length;
				valueSize = param[1].length;
				
				paramSize += keySize + valueSize;
				paramSizes.push(paramSize);
				totalSize += paramSize;

				return {keySize: keySize, valueSize: valueSize};
			});

			tests["overall length is correct"] = function(body) {
				assert.equal(body.length, totalSize);
			};
			
			var currentPos = 0;
			theParams.forEach(function(param, index) {
				if(!Array.isArray(param)) param = [param, ""];

				tests["param *" + param[0] + "*"] = {
					topic: (function(thePos, theLength) {
						return function(body) {
							return body.slice(thePos, thePos + theLength);
						};
					})(currentPos, paramSizes[index]),
					
					"key length is correct": function(paramBuffer) {
						if(pairSizes[index].keySize > 127) {
							assert.equal(bufferUtils.getInt32(paramBuffer, 0), pairSizes[index].keySize + 2147483648);
						}
						else {
							assert.equal(paramBuffer[0], pairSizes[index].keySize);
						}
					},

					"value length is correct": function(paramBuffer) {
						var offset = (pairSizes[index].keySize > 127) ? 4 : 1;

						if(pairSizes[index].valueSize > 127) {
							assert.equal(bufferUtils.getInt32(paramBuffer, offset), pairSizes[index].valueSize + 2147483648);
						}
						else {
							assert.equal(paramBuffer[offset], pairSizes[index].valueSize);
						}
					},

					"key is correct": function(paramBuffer) {
						var offset = ((pairSizes[index].keySize > 127) ? 4 : 1) + ((pairSizes[index].valueSize > 127) ? 4 : 1);
						assert.equal(paramBuffer.toString("utf8", offset, pairSizes[index].keySize + offset), param[0]);
					},
					
					"value is correct": function(paramBuffer) {
						var offset = ((pairSizes[index].keySize > 127) ? 4 : 1) + ((pairSizes[index].valueSize > 127) ? 4 : 1);
						assert.equal(paramBuffer.toString("utf8", pairSizes[index].keySize + offset), param[1]);
					}
				};
				
				currentPos += paramSizes[index];
			});
			
			return tests;
		}
		case fastcgi.records.Data.TYPE: 
		case fastcgi.records.StdIn.TYPE:
		case fastcgi.records.StdOut.TYPE:
		case fastcgi.records.StdErr.TYPE: {
			tests["body data is correct"] = function(body) {
				var dataAsBuffer = Buffer.isBuffer(record.data) ? record.data : new Buffer(record.data); 
				for(var i = 0; i < dataAsBuffer.length; i++) {
					assert.equal(body[i], dataAsBuffer[i], "Data at index #" + i + " does not match.");
				}
			};

			return tests;
		}
		case fastcgi.records.UnknownType.TYPE: {
			tests["type is correct"] = function(body) {
				assert.equal(body[0], record.type);
			};
			
			return tests;
		}
	}
};

var createWriteRecordTest = function(record) {
	var requestId = Math.floor(Math.random() * 65535 + 1);
	var paddingLength = 0;
	var contentLength = 0;
	var header = 0;

	var context = {
		topic: function() {
			var fcgiStream = createFCGIStream();
			fcgiStream.writeRecord(requestId, record);
			return fcgiStream;
		},
		
		"written to underlying stream": function(fcgiStream) {
			assert.isTrue(fcgiStream._writableStream.size() > 0);
		},
		
		"has at least 8 bytes": function(fcgiStream) {
			assert.isTrue(fcgiStream._writableStream.size() >= 8);
			
			// Grab header now for next few vows.
			header = fcgiStream._writableStream.getContents(8);
			
			// Save content and padding lengths.
			contentLength = bufferUtils.getInt16(header, 4);
			paddingLength = header[6];
		},

		"header has correct version": function() {
			assert.equal(header[0], 1);
		},
		
		"header has correct type": function() {
			assert.equal(header[1], record.TYPE);
		},

		"header has correct requestId": function() {
			assert.equal(bufferUtils.getInt16(header, 2), requestId);
		},
		
		"body size matches record calculation": function() {
			assert.equal(contentLength, record.getSize());
		},
		
		"body and padding are correct length": function(fcgiStream) {
			assert.equal(fcgiStream._writableStream.size(), contentLength + paddingLength); 
		},
		
		"padding is correct length": function(fcgiStream) {
			assert.equal(paddingLength, contentLength % 8); 
		}
	};
	
	if(record.getSize()) {
		context["the body"] = createRecordBodyTests(record, function() { return contentLength; });	
	}

	return context;
};

var createReadRecordTest = function(theRecord) {
	var theRequestId = Math.floor(Math.random() * 65535 + 1);
	var fastcgiStream = createFCGIStream();

	var context = {
		topic: function() {
			fastcgiStream.on("record", function(requestId, record) {
				this.callback(null, requestId, record);
			}.bind(this));
			
			fastcgiStream.writeRecord(theRequestId, theRecord);
			fastcgiStream._readableStream.put(fastcgiStream._writableStream.getContents());
		},
		
		// TODO: re-enable this once I've fixed an issue with ReadableStream not reporting correct size inside an emitted data event. 
		/*"read buffer was fully read": function() {
			assert.equal(fastcgiStream._readableStream.size(), 0);
		},*/

		"*requestId* is correct": function(wtf, requestId) {
			assert.equal(requestId, theRequestId);
		},

		"record is correct type": function(wtf, requestId, record) {
			assert.equal(record.TYPE, theRecord.TYPE);
		}
	};
	
	switch(theRecord.TYPE) {
		case fastcgi.records.BeginRequest.TYPE: {
			context["*role* is correct"] = function(wtf, requestId, record) {
				assert.equal(record.role, theRecord.role);
			};
			
			context["*flags* is correct"] = function(wtf, requestId, record) {
				assert.equal(record.flags, theRecord.flags);
			};

			break;
		}
	};

	return context;
};

vows.describe("FastCGIStream Writing").addBatch({
	"Writing an FCGI_BEGIN_REQUEST": createWriteRecordTest(new fastcgi.records.BeginRequest(0xFFFF, 254)),
	"Writing an FCGI_ABORT_REQUEST": createWriteRecordTest(new fastcgi.records.AbortRequest()),
	"Writing an FCGI_END_REQUEST": createWriteRecordTest(new fastcgi.records.EndRequest(4294967295, 254)),
	"Writing an FCGI_PARAMS (empty)": createWriteRecordTest(new fastcgi.records.Params()),
	"Writing an FCGI_PARAMS (small name/value pairs)": createWriteRecordTest(new fastcgi.records.Params([["Test", "Value"], ["AnotherTest", "AnotherValue"]])),
	"Writing an FCGI_PARAMS (large name/value pairs)": createWriteRecordTest(new fastcgi.records.Params([["ThisIsAReallyLongHeaderNameItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah", "ThisIsAReallyLongHeaderValueItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah"], ["AnotherTest", "AnotherValue"]])),
	"Writing an FCGI_STDIN (empty)": createWriteRecordTest(new fastcgi.records.StdIn()),
	"Writing an FCGI_STDIN (string)": createWriteRecordTest(new fastcgi.records.StdIn("Basic String")),
	"Writing an FCGI_STDIN (unicode string)": createWriteRecordTest(new fastcgi.records.StdIn('\u00bd + \u00bc = \u00be')),
	"Writing an FCGI_STDIN (buffer)": createWriteRecordTest(new fastcgi.records.StdIn(new Buffer(2048))),
	"Writing an FCGI_STDOUT (empty)": createWriteRecordTest(new fastcgi.records.StdOut()),
	"Writing an FCGI_STDOUT (string)": createWriteRecordTest(new fastcgi.records.StdOut("Basic String")),
	"Writing an FCGI_STDOUT (unicode string)": createWriteRecordTest(new fastcgi.records.StdOut('\u00bd + \u00bc = \u00be')),
	"Writing an FCGI_STDOUT (buffer)": createWriteRecordTest(new fastcgi.records.StdOut(new Buffer(2048))),
	"Writing an FCGI_STDERR (empty)": createWriteRecordTest(new fastcgi.records.StdErr()),
	"Writing an FCGI_STDERR (string)": createWriteRecordTest(new fastcgi.records.StdErr("Basic String")),
	"Writing an FCGI_STDERR (unicode string)": createWriteRecordTest(new fastcgi.records.StdErr('\u00bd + \u00bc = \u00be')),
	"Writing an FCGI_STDERR (buffer)": createWriteRecordTest(new fastcgi.records.StdErr(new Buffer(2048))),
	"Writing an FCGI_DATA (empty)": createWriteRecordTest(new fastcgi.records.Data()),
	"Writing an FCGI_DATA (string)": createWriteRecordTest(new fastcgi.records.Data("Basic String")),
	"Writing an FCGI_DATA (unicode string)": createWriteRecordTest(new fastcgi.records.Data('\u00bd + \u00bc = \u00be')),
	"Writing an FCGI_DATA (buffer)": createWriteRecordTest(new fastcgi.records.Data(new Buffer(2048))),
	"Writing an FCGI_GET_VALUES (empty)": createWriteRecordTest(new fastcgi.records.GetValues()),
	"Writing an FCGI_GET_VALUES (small name/value pairs)": createWriteRecordTest(new fastcgi.records.GetValues(["Test", "Value", "AnotherTest", "AnotherValue"])),
	"Writing an FCGI_GET_VALUES (large name/value pairs)": createWriteRecordTest(new fastcgi.records.GetValues(["ThisIsAReallyLongHeaderNameItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah", "ThisIsAReallyLongHeaderValueItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah", "AnotherTest", "AnotherValue"])),
	"Writing an FCGI_GET_VALUES_RESULT (empty)": createWriteRecordTest(new fastcgi.records.GetValuesResult()),
	"Writing an FCGI_GET_VALUES_RESULT (small name/value pairs)": createWriteRecordTest(new fastcgi.records.GetValuesResult([["Test", "Value"], ["AnotherTest", "AnotherValue"]])),
	"Writing an FCGI_GET_VALUES_RESULT (large name/value pairs)": createWriteRecordTest(new fastcgi.records.GetValuesResult([["ThisIsAReallyLongHeaderNameItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah", "ThisIsAReallyLongHeaderValueItIsGoingToExceedOneHundredAndTwentySevenBytesJustYouWatchAreYouReadyOkHereWeGoBlahBlahBlahBlahBlahBlah"], ["AnotherTest", "AnotherValue"]])),
	"Writing an FCGI_UNKNOWN_TYPE": createWriteRecordTest(new fastcgi.records.UnknownType(254))
}).export(module);

// We're verifying the record reading against records written out by the same system.
// You might consider this dumb, but I think it's okay, give that we've already run a shiteload of sanity checks on the records.
// And we've tested the raw binary output of the writing process, making sure it's according to spec.
vows.describe("FastCGIStream Reading").addBatch({
	"Reading an FCGI_BEGIN_REQUEST": createReadRecordTest(new fastcgi.records.BeginRequest(fastcgi.role.Responder, 254))
}).export(module);

// TODO: sanity checks to make sure you can't write params with name/values larger than 2147483647 bytes (each).
// TODO: sanity checks to make sure you can't write stdin/stdout/stderr/data records with a body larger than 65535 bytes.
// TODO: can name/value pairs contain unicode data?
// TODO: test numerous records coming in on a stream simultaneously.