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
			    appId: '', // 必填，公众号的唯一标识
			    timestamp: , // 必填，生成签名的时间戳
			    nonceStr: '', // 必填，生成签名的随机串
			    signature: '',// 必填，签名，见附录1
			    jsApiList: [] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
			});		
		</script>
	</body>
</html>	
*/})

app.use(function *(next) {
	// 如果網址中有特殊字串，如 (/movie)
	if (this.url.indexOf('/movie') > -1) {
		this.body = ejs.render(tpl, {})

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

