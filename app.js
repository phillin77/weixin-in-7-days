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
}) // app.use

app.listen(server_port)
console.log('Listening: %s', server_port)

