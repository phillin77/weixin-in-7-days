/**
 * WeiXin Config
 * start:  2017.08.08
 * update: 2017.08.08
 * version:
 *     2017.08.08 [ADD]  1st Version
 */

'use strict'

var path = require('path')
var util = require('./libs/util')

// 儲存 access_token 的檔案
const WECHAT_FILE = path.join(__dirname, './config/wechat.txt')

// WeChat 開發帳號設定值，與公用函式
const config = {
	wechat: {
		appID: process.env.WECHAT_APP_ID || '',
		appSecret: process.env.WECHAT_APP_SECRET || '',
		token: process.env.WECHAT_APP_TOKEN || '',

		// 將 access_token 從實體媒體中讀出
		getAccessToken: function() {
			return util.readFileAsync(WECHAT_FILE)
		},
		// 將 access_token 存回實體媒體
		saveAccessToken: function(data) {
			data = JSON.stringify(data)
			return util.writeFileAsync(WECHAT_FILE, data)
		}
	}
} // config

module.exports = config
