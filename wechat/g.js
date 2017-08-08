/**
 * Generator
 * start:  2017.08.08
 * update: 2017.08.08
 * version:
 *     2017.08.08 [ADD]  1st Version
 */

'use strict'

var sha1 = require('sha1')
var getRawBody = require('raw-body')

var Wechat = require('./wechat')
var util = require('./wechat_util')

module.exports = function(opts, handler) {
	// 建立全域使用的 WeChat Instance
	var wechat = new Wechat(opts)

	return function *(next) {
		var that = this

		// TODO ONLY for Debugging
		// console.log(this.query)

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
				this.body = echostr + ''
			}
			else {
				this.body = 'wrong'
			}
		} // if (this.method === 'GET')
		else if (this.method === 'POST') {
			// 驗證訊息是否來自微信服務器，如果不是，回傳 'wrong'
			if (sha !== signature) {
				this.body = 'wrong'

				return false
			}

			// 取得 POST 過來的原始的 xml 內容
			var data = yield getRawBody(this.req, {
				length: this.length,
				limit: '1mb',
				encoding: this.chatset
			})

			var content = yield util.parseXmlAsync(data)

			// TODO ONLY for Debugging
			// console.log('content: ', content)

			var message = util.formatMessage(content.xml)
			// TODO ONLY for Debugging
			console.log('incoming message: ', message)

			this.weixin = message

			// 將處理交給外部業務面的 handler 處理
			yield handler.call(this, next)

			wechat.reply.call(this)			

		} // if (this.method === 'POST')
	} // return function* (next)
} // module.exports

