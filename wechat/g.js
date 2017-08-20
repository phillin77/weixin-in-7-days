/**
 * Generator
 * start:  2017.08.08
 * update: 2017.08.20
 * version:
 *     2017.08.08 [ADD]  1st Version (for koa v1)
 *     2017.08.20 [EDIT] for koa v2
 */

'use strict'

var sha1 = require('sha1')
var getRawBody = require('raw-body')

var Wechat = require('./wechat')
var util = require('./wechat_util')

module.exports = function(opts, handler) {
	// 建立全域使用的 WeChat Instance
	var wechat = new Wechat(opts)

	// TODO koa v1 to koa v2
	// return function *(next) {  // for koa 1
	return async function (ctx, next) {  // for koa 2
		var that = this

		// ONLY for Debugging
		// console.log(this.query)
		// console.log('ctx: ', ctx)
		// console.log('this.method: ', this.method)

		var token = opts.token
		var signature = this.query.signature
		var nonce = this.query.nonce
		var timestamp = this.query.timestamp
		var echostr = this.query.echostr
		var str = [token, timestamp, nonce].sort().join('')
		var sha = sha1(str)

		if (this.method === 'GET') {
			// 驗證訊息是否來自微信服務器
			// reference: https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421135319
			if (sha === signature) {
				// TODO koa v1 to koa v2
				// this.body = echostr + ''  // for koa 1: use this
				ctx.body = echostr + ''  // for koa 2: use ctx
				// console.log('echostr:', echostr)
			}
			else {
				// TODO koa v1 to koa v2
				// this.body = 'wrong'  // for koa 1: use this
				ctx.body = 'wrong'  // for koa 2: use ctx
				// console.log('signature wrong')
			}
		} // if (this.method === 'GET')
		else if (this.method === 'POST') {
			// 驗證訊息是否來自微信服務器，如果不是，回傳 'wrong'
			if (sha !== signature) {
				// TODO koa v1 to koa v2
				// this.body = 'wrong'  // for koa 1: use this
				ctx.body = 'wrong'  // for koa 2: use ctx

				return false
			}

			// TODO koa v1 to koa v2
			// 取得 POST 過來的原始的 xml 內容
			// var data = yield getRawBody(this.req, {  // for koa 1: use yield
			var data = await getRawBody(this.req, {  // for koa 2: use await
				length: this.length,
				limit: '1mb',
				encoding: this.chatset
			})

			// TODO koa v1 to koa v2
			// var content = yield util.parseXmlAsync(data)
			var content = await util.parseXmlAsync(data)

			// TODO ONLY for Debugging
			// console.log('content: ', content)

			var message = util.formatMessage(content.xml)
			// TODO ONLY for Debugging
			console.log('incoming message: ', message)

			this.weixin = message

			// 將處理交給外部業務面的 handler 處理
			// TODO koa v1 to koa v2
			// yield handler.call(this, next)
			await handler.call(this, ctx)

			wechat.reply.call(this, ctx)			

		} // if (this.method === 'POST')
	} // return function* (next)
} // module.exports

