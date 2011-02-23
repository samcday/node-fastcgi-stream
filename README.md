# FastCGI Stream Lib

Read/write FastCGI records from a stream. Like a boss.

# Installation

npm.

	npm install fastcgi-stream

# Usage

Include the package.

	var fastcgi = require("fastcgi-stream");

The FastCGI stream library has two main pieces, the `FastCGIStream` itself and the records that can be sent and received on it.
	
The `FastCGIStream` wraps an existing `Stream` to send/receive FCGI records on. 99% of the time this is going to be a `net.Socket`.

	var fcgiStream = new fastcgi.FastCGIStream(mySocket);
	
Send records through it.

	fcgiStream.writeRecord(requestId, new fastcgi.records.BeginRequest(
		fastcgi.records.BeginRequest.roles.RESPONDER,
		fastcgi.records.BeginRequest.flags.KEEP_CONN
	));
	
Receive records from it.

	fcgiStream.on("record", function(requestId, record) {
		if(requestId == fastcgi.constants.NULL_REQUEST_ID) {
			// Management record.
		}
		else {
			switch(record.TYPE) {
				case fastcgi.records.BeginRequest.TYPE: {
					// Request beginning. What role are we being asked to fulfill?
					if(record.role == fastcgi.records.BeginRequest.role.RESPONDER) {
						// Etc...
					}
					
					break;
				}
			}
		}
	});

# Records

All record objects live in the `fastcgi.records` namespace. Each record will now be listed. The listing will detail the constructor and parameters each record contains.

Constructor args are never mandatory, you can pass as many or as few arguments as you like.

### BeginRequest

	var record = new fastcgi.records.BeginRequest(role, flags);
	
* `.role` - the role being requested. Possible roles as follows:
	* `fastcgi.records.BeginRequest.roles.RESPONDER`
	* `fastcgi.records.BeginRequest.roles.AUTHORIZER`
	* `fastcgi.records.BeginRequest.roles.FILTER`
* `.flags` - additional flags for the request. There is only one in the specification:
	* `fastcgi.records.BeginRequest.flags.KEEP_CONN`
	
### AbortRequest

	var record = new fastcgi.records.AbortRequest();
	
### EndRequest

	var record = new fastcgi.records.EndRequest(appStatus, protocolStatus);
	
* `.appStatus` - application return status code
* `.protocolStatus` - protocol return status code, can be one of the following:
	* `fastcgi.records.EndRequest.protocolStatus.REQUEST_COMPLETE`
	* `fastcgi.records.EndRequest.protocolStatus.CANT_MPX_CONN`
	* `fastcgi.records.EndRequest.protocolStatus.OVERLOADED` 
	* `fastcgi.records.EndRequest.protocolStatus.UNKNOWN_ROLE`
	
### Params

	var params = [
		["Name", "Value"],
		["AnotherName", "AnotherValue"]
	];
	
	// Params is optional.
	var record = new fastcgi.records.Params(params);
	
`.params` - an array of name/value array pairs

### StdIn/StdOut/StdErr/Data

All of these records take the same constructor and have the same properties.

	var body = "String";
	var record = new fastcgi.records.StdIn(body);

	// .. or ..

	var body = new Buffer("Contents.");
	var record = new fastcgi.records.StdIn(body);
	
### GetValues

	var values = ["Name", "AnotherName"];
	var record = new fastcgi.records.GetValues(values);
	
`.values` - array of values being requested

### GetValuesResult

	var result = [
		["Name", "Value"],
		["AnotherName", "AnotherValue"]
	];

	var record = new fastcgi.records.GetValuesResult(result);
	
`.result` - array of name/value pairs representing the result.

### UnknownType

	var record = new fastcgi.records.UnknownType(type);
	
`.type` - the type of record that was not recognized.

