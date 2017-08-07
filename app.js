/**
 * 主程式
 * start:  2017.08.07
 * update: 2017.08.07
 * version:
 *     2017.08.07 [ADD]  1st Version
 */

'use strict'

var Koa = require('koa')
var sha1 = require('sha1')

var server_port = process.env.WECHAT_PORT || 1234
var config = {
	wechat: {
		appID: process.env.WECHAT_APP_ID || '',
		appSecret: process.env.WECHAT_APP_SECRET || '',
		token: process.env.WECHAT_APP_TOKEN || ''
	}
}

var app = new Koa()

app.use(function* (next) {
	console.log(this.query)

	var token = config.wechat.token
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

}) // app.use

app.listen(server_port)
console.log('Listening: %s', server_port)

