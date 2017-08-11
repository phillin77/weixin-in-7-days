/**
 * 主程式
 * start:  2017.08.07
 * update: 2017.08.11
 * version:
 *     2017.08.11 [ADD]  1st Version
 *     
 */

'use strict'

var Koa = require('koa')
var wechat = require('./wechat/g')
var config = require('./config')
var reply = require('./weixin/reply')

const server_port = process.env.WECHAT_PORT || 1234

var app = new Koa()

//----------------------------------------------------
// 測試 JS-SDK 的接口用的簡易版 route 實作
// Note: 如果不使用 JS-SDK，則不須這個 middleware 的 usr

app.use(function *(next) {
	// 如果網址中有特殊字串，如 (/movie)
	if (this.url.indexOf('/movie') > -1) {
		this.body = '<hi>Hi JS-SDK'

		return next  // 處理完畢，不再往下走其他的 middleware，返回頁面結果
	}

	yield next
})

// end of 測試 JS-SDK 的接口用的簡易版 route 實作
//----------------------------------------------------

// 引入 微信 實作的中間件 (middleware)
app.use(wechat(config.wechat, reply.reply))

app.listen(server_port)
console.log('Listening: %s', server_port)

