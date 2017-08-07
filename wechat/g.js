/**
 * Generator
 * start:  2017.08.08
 * update: 2017.08.08
 * version:
 *     2017.08.08 [ADD]  1st Version
 */

'use strict'

var sha1 = require('sha1')

module.exports = function(opts) {
	return function* (next) {
		console.log(this.query)

		var token = opts.token
		var signature = this.query.signature
		var nonce = this.query.nonce
		var timestamp = this.query.timestamp
		var echostr = this.query.echostr
		var str = [token, timestamp, nonce].sort().join('')
		var sha = sha1(str)

		if (sha === signature) {
			this.body = echostr + ''
		}
		else {
			this.body = 'wrong'
		}
	} // return function* (next)
} // module.exports

