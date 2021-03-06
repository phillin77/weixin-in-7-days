/**
 * 微信 JS-SDK 的接口用的簡易版 route 實作: 查詢電影
 * start:  2017.08.18
 * update: 2017.08.20
 * version:
 *     2017.08.20 [ADD]  1st Version
 */


//----------------------------------------------------
// 測試 微信 JS-SDK 的接口用的簡易版 route 實作
// Note: 如果不使用 JS-SDK，則不須這個 middleware 的 use

'use strict'

var Wechat = require('../../wechat/wechat')
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
		<link rel="stylesheet" href="/css/style.css">
	</head>
	<body ontouchstart="">
		<button class="btn btn_primary" id="rec">點擊，開始錄音翻譯</button>
		<p id="title"></p>
		<div id="director"></div>
		<div id="year"></div>
		<div id="poster"></div>
		<div id="poster_note" hidden>(點擊圖片，左右移動可預覽)</div>

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
					'translateVoice',

					'onMenuShareTimeline',
					'onMenuShareAppMessage',
					'onMenuShareQQ',
					'onMenuShareWeibo',
					'onMenuShareQZone',

					'previewImage'
			    ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
			});
		</script>

		<!-- 步骤四：通过ready接口处理成功验证 -->
		<script>

			// config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
			wx.ready(function(){

				// 判断当前客户端版本是否支持指定JS接口
				wx.checkJsApi({
				    jsApiList: ['onVoiceRecordEnd'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
				    success: function(res) {
				    	console.log(res)
				        // 以键值对的形式返回，可用的api值true，不可用为false
				        // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
				    }
				});

				//--------------------------------------------------------
				// 分享给朋友

				// 預設內容
				var shareContent = {
				    title: '', // 分享标题
				    desc: '', // 分享描述
				    link: '', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
				    imgUrl: '', // 分享图标
				    //type: '', // 分享类型,music、video或link，不填默认为link
				    //dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
				    success: function () { 
				        // 用户确认分享后执行的回调函数
				        window.alert('分享成功')
				    },
				    cancel: function () { 
				        // 用户取消分享后执行的回调函数
				        window.alert('分享失敗')
				    }
				}
				
				// 啟動就設定好分享的內容
				wx.onMenuShareAppMessage(shareContent);

				//--------------------------------------------------------
				// 预览图片接口
				var slides = {}
				$('#poster').on('click', function() {
					// Note: slides 內容會在搜尋結果成功回傳後更新
					wx.previewImage(slides);
				}) // $('#poster').on('click', function()

				//--------------------------------------------------------
				// 錄音、STT (识别音频 translateVoice)
				var isRecording = false

				// 點擊，開始錄音
				$('#rec').on('click', function() {
					console.log("Tap")

					if (!isRecording) {
						isRecording = true
						$('#rec').text('結束錄音')

						wx.startRecord({
							cancel: function() {
								window.alert('那就無法使用語音搜尋電影的功能')
							}
						});
						return
					}

					isRecording = false
					$('#rec').text('點擊，開始錄音翻譯')

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
							    	var result = res.translateResult  // 语音识别的结果

							    	// 使用 豆瓣 API V2 :: 电影条目搜索
							    	// https://developers.douban.com/wiki/?title=movie_v2
									
									$.ajax({
										type: 'get',
										url: 'https://api.douban.com/v2/movie/search?q=' + result,
										dataType: 'jsonp',
										jsonp: 'callback',
										success: function(data) {
											// console.log(data)
											var subject = data.subjects[0]
											// console.log(subject)

											$('#title').html(subject.title)
											$('#year').html(subject.year)
											$('#director').html(subject.directors[0].name)
											$('#poster').html('<img src="' + subject.images.large + '" />')

											// 設定 分享给朋友 的內容
											var shareContent = {
											    title: subject.title, // 分享标题
											    desc: 'j我搜出來了 ' + subject.title, // 分享描述
											    link: 'https://github.com', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
											    imgUrl: subject.images.large , // 分享图标
											    //type: '', // 分享类型,music、video或link，不填默认为link
											    //dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
											    success: function () { 
											        // 用户确认分享后执行的回调函数
											        window.alert('分享成功')
											    },
											    cancel: function () { 
											        // 用户取消分享后执行的回调函数
											        window.alert('分享失敗')
											    }
											}

											wx.onMenuShareAppMessage(shareContent);

											// 設定 预览图片接口 的傳入參數
											slides = {
												current: subject.images.large,
												urls: []
											}
											data.subjects.forEach(function(item) {
												slides.urls.push(item.images.large)
											})

											$('#poster_note').show();									
										} // success
									}) // $.ajax()
							    }
							});
					    }
					});
				})  // $('#rec').on('click', function()
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

var wx = require('../../weixin/index')

//----------------------------------------------
/**
 * route (Generator for koa v1)
 */
// exports.movie = function *(next) {
// 	var wechatApi = wx.getWechat();

// 	var data = yield wechatApi.fetchAccessToken()
// 	var access_token = data.access_token
// 	var ticketData = yield wechatApi.fetchJSTicket(access_token)
// 	var ticket = ticketData.ticket
// 	var url = this.href  // 取得目前頁面的 URL
// 	var params = sign(ticket, url)

// 	// 加上 appId 到要傳入 template 的參數中
// 	params.appId = process.env.WECHAT_APP_ID

// 	console.log("JS-SDK ticket: ", ticket)
// 	console.log("JS-SDK url:", url)  // NOTE: 有時測試工具會在後面加上端口號 (如 8080)，如果有，要自行用字串取代移除端口號
// 	console.log("JS-SDK params: ", params)

// 	this.body = ejs.render(tpl, params)  // 將 params 作為數據傳入 template
// } // exports.movie

//----------------------------------------------
/**
 * route (async function for koa v2)
 */
// Note for koa v1 to koa v2:
//   1.this (in v1) => ctx (in v2)
//   2.function *(next) in v1 => async function(ctx) in v2
//   3.yield yourFunction in v1 => await yourFunction in v2
exports.movie = async function(ctx, next) {
	var wechatApi = wx.getWechat();

	var data = await wechatApi.fetchAccessToken()
	var access_token = data.access_token
	var ticketData = await wechatApi.fetchJSTicket(access_token)
	var ticket = ticketData.ticket
	var url = ctx.href  // 取得目前頁面的 URL
	// console.log('ctx.href', ctx.href)
	var params = sign(ticket, url)

	// 加上 appId 到要傳入 template 的參數中
	params.appId = process.env.WECHAT_APP_ID

	// TODO For Debugging ONLY
	console.log("JS-SDK ticket: ", ticket)
	console.log("JS-SDK url:", url)  // NOTE: 有時測試工具會在後面加上端口號 (如 8080)，如果有，要自行用字串取代移除端口號
	console.log("JS-SDK params: \n", params)

	ctx.body = ejs.render(tpl, params)  // 將 params 作為數據傳入 template
} // exports.movie
