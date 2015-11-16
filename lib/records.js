'use strict';

module.exports = {
  BeginRequest: require('./records/begin_request'),
  AbortRequest: require('./records/abort_request'),
  EndRequest: require('./records/end_request'),
  Params: require('./records/params'),
  StdIn: require('./records/stdin'),
  StdOut: require('./records/stdout'),
  StdErr: require('./records/stderr'),
  Data: require('./records/data'),
  GetValues: require('./records/get_values'),
  GetValuesResult: require('./records/get_values_result'),
  UnknownType: require('./records/unknown_type')
};
