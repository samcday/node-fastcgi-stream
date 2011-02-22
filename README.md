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

## BeginRequest

	var record = new fastcgi.records.BeginRequest(role, flags);
	
* `.role` - the role being requested
* `.flags` - additional flags for the request. There is only one in the specification:
	* `fastcgi.records.BeginRequest.flags.KEEP_CONN`