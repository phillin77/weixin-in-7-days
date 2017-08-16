/**
 * 主程式
 * start:  2017.08.07
 * update: 2017.08.17
 * version:
 *     2017.08.17 [ADD]  1st Version
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
// 測試 微信 JS-SDK 的接口用的簡易版 route 實作
// Note: 如果不使用 JS-SDK，則不須這個 middleware 的 use

const static_serve = require('koa-static')  // for 靜態檔案
var Wechat = require('./wechat/wechat')
var crypto = require('crypto')
var ejs = require('ejs')
var heredoc = require('heredoc')
var tpl = heredoc(function(){/*
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<meta charset="utf-8">
		<title>搜電影</title>
		<meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1">
		<link rel="stylesheet" href="css/style.css">
	</head>
	<body ontouchstart="">
		<button class="btn btn_primary" id="rec">點擊，開始錄音翻譯</button>
		<p id="title"></p>
		<div id="director"></div>
		<div id="year"></div>
		<div id="poster"></div>

<!--
		<script scr="//code.jquery.com/jquery-1.12.4.min.js" type="text/javascript"></script>
		<script scr="//zeptojs.com/zepto-docs.min.js" type="text/javascript"></script>
		<script scr="/js/zepto.min.js" type="text/javascript"></script>		

		<script type="text/javascript" scr="js/jquery-1.12.4.min.js"></script>
-->

		<!-- 如用 CDN 的方式，會找不到 $ -->
<!--
		<script scr="http://zeptojs.com/zepto.min.js"></script>
-->

		<!--网上下载zepto.min.js-->
		<script src="/js/zepto.min.js"> </script>

		<!-- 微信 JS-SDK 步骤二：引入JS文件 -->
		<script type="text/javascript">
		    // define = null;
		    // require = null;
		</script>
		<script src="//res.wx.qq.com/open/js/jweixin-1.2.0.js" type="text/javascript"></script>

		<!-- 微信 JS-SDK 步骤三：通过config接口注入权限验证配置 -->
		<script>
			wx.config({
			    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
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

		<!-- 步骤四：通过ready接口处理成功验证 -->
		<script>

			// config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
			wx.ready(function(){

				<!-- 判断当前客户端版本是否支持指定JS接口 -->
				wx.checkJsApi({
				    jsApiList: ['onVoiceRecordEnd'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
				    success: function(res) {
				    	console.log(res)
				        // 以键值对的形式返回，可用的api值true，不可用为false
				        // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
				    }
				});

				var isRecording = false

				// 點擊，開始錄音
				$('#rec').on('click', function() {
					console.log("Tap")

					if (!isRecording) {
						isRecording = true
						wx.startRecord({
							cancel: function() {
								window.alert('那就無法使用語音搜尋電影的功能')
							}
						});
						return
					}

					isRecording = false

					// 停止录音接口
					wx.stopRecord({
					    success: function (res) {
					    	// 成功錄音，取得本地端音頻的 Id (路徑)
					        var localId = res.localId;

					        // 识别音频并返回识别结果接口
							wx.translateVoice({
							   localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
							    isShowProgressTips: 1, // 默认为1，显示进度提示
							    success: function (res) {
							    	window.alert(res.translateResult); // 语音识别的结果
							    }
							});
					    }
					});
				})  // $('h1').on('tap', function()
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

// static path (/js, /css, /image)
app.use(static_serve(__dirname + '/static'))

// route
app.use(function *(next) {
	// 如果網址中有特殊字串，如 (/movie)
	if (this.url.indexOf('/movie') > -1) {
		var wechatApi = new Wechat(config.wechat)
		var data = yield wechatApi.fetchAccessToken()
		var access_token = data.access_token
		var ticketData = yield wechatApi.fetchJSTicket(access_token)
		var ticket = ticketData.ticket
		var url = this.href  // 取得目前頁面的 URL
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

// end of 測試 微信 JS-SDK 的接口用的簡易版 route 實作
//----------------------------------------------------

// 引入 微信 實作的中間件 (middleware)
app.use(wechat(config.wechat, reply.reply))

app.listen(server_port)
console.log('Listening: %s', server_port)

