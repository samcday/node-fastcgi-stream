# fastcgi-stream

[![Build Status][badge-travis-img]][badge-travis-url]
[![Dependency Information][badge-david-img]][badge-david-url]
[![Code Climate][badge-climate-img]][badge-climate-url]
[![Test Coverage][badge-coverage-img]][badge-coverage-url]
[![npmjs.org][badge-npm-img]][badge-npm-url]

Read & write FastCGI records from a node.js stream like a boss.

## Quickstart

```
npm install fastcgi-stream --save
```

The FastCGI stream library has two main pieces, the `FastCGIStream` itself and the records that can be sent and received on it.
	
The `FastCGIStream` wraps an existing `Stream` to send/receive FCGI records on. 99% of the time this is going to be a `net.Socket`.

```js
var fastcgi = require('fastcgi-stream');

var fcgiStream = new fastcgi.FastCGIStream(mySocket);

// Send FastCGI records.
fcgiStream.writeRecord(requestId, new fastcgi.records.BeginRequest(
	fastcgi.records.BeginRequest.roles.RESPONDER,
	fastcgi.records.BeginRequest.flags.KEEP_CONN
));

// Receive FastCGI records.
fcgiStream.on('record', function(requestId, record) {
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
```

## Records

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

```js
var params = [
	['Name', 'Value'],
	['AnotherName', 'AnotherValue']
];

// Params is optional.
var record = new fastcgi.records.Params(params);
```

`.params` - an array of name/value array pairs

### StdIn/StdOut/StdErr/Data

All of these records take the same constructor and have the same properties.

```js
var body = 'String';
var record = new fastcgi.records.StdIn(body);

// .. or ..

var body = new Buffer('Contents.');
var record = new fastcgi.records.StdIn(body);
```
	
### GetValues

```js
var values = ['Name', 'AnotherName'];
var record = new fastcgi.records.GetValues(values);
```
	
`.values` - array of values being requested

### GetValuesResult

```js
var result = [
	['Name', 'Value'],
	['AnotherName', 'AnotherValue']
];

var record = new fastcgi.records.GetValuesResult(result);
```
	
`.values` - array of name/value pairs representing the result.

### UnknownType

```js
var record = new fastcgi.records.UnknownType(type);
```
	
`.type` - the type of record that was not recognized.


# License

node-fastcgi-stream is free and unencumbered public domain software. For more information, see the accompanying UNLICENSE file.

[badge-travis-img]: https://img.shields.io/travis/samcday/node-fastcgi-stream.svg?style=flat-square
[badge-travis-url]: https://travis-ci.org/samcday/node-fastcgi-stream
[badge-david-img]: https://img.shields.io/david/samcday/node-fastcgi-stream.svg?style=flat-square
[badge-david-url]: https://david-dm.org/samcday/node-fastcgi-stream
[badge-npm-img]: https://img.shields.io/npm/dm/fastcgi-stream.svg
[badge-npm-url]: https://www.npmjs.org/package/fastcgi-stream
[badge-climate-img]: https://img.shields.io/codeclimate/github/samcday/node-fastcgi-stream.svg?style=flat-square
[badge-climate-url]: https://codeclimate.com/github/samcday/node-fastcgi-stream
[badge-coverage-img]: https://img.shields.io/codeclimate/coverage/github/samcday/node-fastcgi-stream.svg?style=flat-square
[badge-coverage-url]: https://codeclimate.com/github/samcday/node-fastcgi-stream
[node-docs-stream]: http://nodejs.org/api/stream.html
