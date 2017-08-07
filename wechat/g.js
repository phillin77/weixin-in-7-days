/**
 * Generator
 * start:  2017.08.08
 * update: 2017.08.08
 * version:
 *     2017.08.08 [ADD]  1st Version
 */

'use strict'

var sha1 = require('sha1')
var Promise = require('bluebird')  // 使用 bluebird 提供的 Promise

// If you're using Bludbird v2
// var request = Promise.promisify(require('request'))  // 使用 bluebird 提供的 Promise 將 request Promise 化

// If you're using Bluebird v3, you'll want to use the multiArgs option:
var request = Promise.promisify(require("request"), {multiArgs: true});
Promise.promisifyAll(request, {multiArgs: true})

var Wechat = require('./wechat')

module.exports = function(opts) {
	// 建立全域使用的 WeChat Instance
	var wechat = new Wechat(opts)

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

