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

var Wechat = require('./wechat/wechat')
var crypto = require('crypto')
var ejs = require('ejs')
var heredoc = require('heredoc')
var tpl = heredoc(function(){/*
<!DOCTYPE html>
<html>
	<head>
		<title>猜電影</title>
		<meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1">
	</head>
	<body>
		<h1>點擊標題，開始錄音翻譯</h1>
		<p id="title"></p>
		<div id="poster"></div>
		<script scr="http://zeptojs.com/zepto-docs.min.js"></script>

		<!-- 步骤二：引入JS文件 -->
		<script scr="http://res.wx.qq.com/open/js/jweixin-1.2.0.js"></script>
		<!-- 步骤三：通过config接口注入权限验证配置 -->
		<script>
			wx.config({
			    debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
			    appId: '<%= appId %>', // 必填，公众号的唯一标识
			    timestamp: <%= timestamp %>, // 必填，生成签名的时间戳
			    nonceStr: '<%= noncestr %>', // 必填，生成签名的随机串
			    signature: '<%= signature %>',// 必填，签名，见附录1
			    jsApiList: [
					'startRecord',
					'stopRecord',
					'onVoiceRecordEnd',
					'translateVoice'					
			    ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
			});		
		</script>
	</body>
</html>	
*/})

// 生成隨機字符串
var createNonce = function() {
	return Math.random().toString(36).substr(2, 15)
} // createNonce

// 生成 timestamp
var createTimestamp = function() {
	return parseInt(new Date().getTime()/1000, 10) + ''
} // createTimestamp

var _sign = function(noncestr, ticket, timestamp, url) {
	var params = [
		'noncestr=' + noncestr,
		'jsapi_ticket=' + ticket,
		'timestamp=' + timestamp,
		'url=' + url
	]
	var str = params.sort().join('&')
	var shasum = crypto.createHash('sha1')
	shasum.update(str)
	return shasum.digest('hex')
} // _sign()

// JS-API 的 簽名算法
// reference:
//   https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115
//   附录1-JS-SDK使用权限签名算法
function sign(ticket, url) {
	var noncestr = createNonce()
	var timestamp = createTimestamp()
	var signature = _sign(noncestr, ticket, timestamp, url)

	return {
		noncestr: noncestr,
		timestamp: timestamp,
		signature: signature
	}
} // sign()

app.use(function *(next) {
	// 如果網址中有特殊字串，如 (/movie)
	if (this.url.indexOf('/movie') > -1) {
		var wechatApi = new Wechat(config.wechat)
		var data = yield wechatApi.fetchAccessToken()
		var access_token = data.access_token
		var ticketData = yield wechatApi.fetchJSTicket(access_token)
		var ticket = ticketData.ticket
		var url = this.href
		var params = sign(ticket, url)

		// 加上 appId 到要傳入 template 的參數中
		params.appId = process.env.WECHAT_APP_ID

		console.log("JS-SDK ticket: ", ticket)
		console.log("JS-SDK url:", url)  // NOTE: 有時測試工具會在後面加上端口號 (如 8080)，如果有，要自行用字串取代移除端口號
		console.log("JS-SDK params: ", params)

		this.body = ejs.render(tpl, params)  // 將 params 作為數據傳入 template

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

