* sanity checks in test suite to ensure you can't write params with name/values larger than 2147483647 bytes (each). Err correction, a single param length shouldn't exceed body length, maximum should probably be 65,530. This is maximum body size - 4 (for length preamble of pair item) - 1 (length preamble for other pair item)
* sanity checks to make sure you can't write stdin/stdout/stderr/data records with a body larger than 65535 bytes.
* can name/value pairs contain unicode data?
* test code is looking pretty butt-ugly now. needs a cleanup for readability and code review.