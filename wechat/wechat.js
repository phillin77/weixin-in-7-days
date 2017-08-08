/**
 * WeChat API 的封裝
 * start:  2017.08.08
 * update: 2017.08.08
 * version:
 *     2017.08.08 [ADD]  1st Version
 */

'use strict'

var Promise = require('bluebird')  // 使用 bluebird 提供的 Promise

// If you're using Bludbird v2
// var request = Promise.promisify(require('request'))  // 使用 bluebird 提供的 Promise 將 request Promise 化

// If you're using Bluebird v3, you'll want to use the multiArgs option:
var request = Promise.promisify(require("request"), {multiArgs: true});
Promise.promisifyAll(request, {multiArgs: true})

var util = require('./wechat_util')

// WeChat API 網址定義
const prefix = 'https://api.weixin.qq.com/cgi-bin/'
const api = {
	// 获取access_token (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140183)
	accessToken: prefix + 'token?grant_type=client_credential'
} // api

/**
 * Constructor for Wechat Global Instance
 * @param {Object} opts 設定值
 */
function Wechat(opts) {
	var that = this

	this.appID = opts.appID
	this.appSecret = opts.appSecret
	this.getAccessToken = opts.getAccessToken
	this.saveAccessToken = opts.saveAccessToken

	// 讀取 access_token
	this.getAccessToken()
		.then(function(data) {
			try {
				// 將字串轉成 JSON
				data = JSON.parse(data)
			}
			catch(e) {
				// 如果失敗，重新更新 access_token
				return that.updateAccessToken()
			}

			// 檢查 access_token 是否有效與合法
			if (that.isValidAccessToken(data)) {
				Promise.resolve(data)
			}
			else {
				// 重新更新 access_token
				return that.updateAccessToken()
			}
		})
		.then(function(data) {
			if (data) {
				// 將 access_token 儲存到目前執行的 Global Instance 中
				that.access_token = data.access_token
				that.expires_in = data.expires_in

				// 將 access_token 儲存到實體儲存媒體中
				that.saveAccessToken(data)
			}
		})
} // Wechat

/** 
 * 檢查 access_token 是否合法？有沒有過期？
 */
Wechat.prototype.isValidAccessToken = function(data) {
	if (!data || !data.access_token || !data.expires_in) {
		return false
	}

	var access_token = data.access_token
	var expires_in = data.expires_in
	var now = (new Date().getTime())

	if (now < expires_in) {
		return true
	}
	else {
		return false
	}
} // isValidAccessToken

/**
 * 從 微信 Server 取得新的 access_token
 * reference: https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140183
 */
Wechat.prototype.updateAccessToken = function() {
	var appID = this.appID
	var appSecret = this.appSecret
	var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret

	return new Promise(function(resolve, reject) {
		request({url: url, json: true})
		.then(function(response) {
			var data = response[1]
			var now = (new Date().getTime())
			var expires_in = now + (data.expires_in - 20) * 1000  // 讓 access_token 提前 20 秒更新

			data.expires_in = expires_in

			resolve(data)
		})
	}) // return new Promise
} // updateAccessToken

Wechat.prototype.reply = function() {
	var content = this.body
	var message = this.weixin
	var xml = util.tpl(content, message)

	this.status = 200
	this.type = 'application/xml'
	this.body = xml
} // reply

module.exports = Wechat
