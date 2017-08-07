/**
 * 主程式
 * start:  2017.08.07
 * update: 2017.08.08
 * version:
 *     2017.08.08 [ADD]  1st Version
 *     
 */

'use strict'

var Koa = require('koa')
var wechat = require('./wechat/g')

var server_port = process.env.WECHAT_PORT || 1234
var config = {
	wechat: {
		appID: process.env.WECHAT_APP_ID || '',
		appSecret: process.env.WECHAT_APP_SECRET || '',
		token: process.env.WECHAT_APP_TOKEN || ''
	}
} // config

var app = new Koa()

app.use(wechat(config.wechat))

app.listen(server_port)
console.log('Listening: %s', server_port)

