/**
 * WeiXin 業務面處理邏輯 / Generator
 * start:  2017.08.08
 * update: 2017.08.08
 * version:
 *     2017.08.08 [ADD]  1st Version
 */

'use strict'

var config = require('./config')
var Wechat = require('./wechat/wechat')
var wechatApi = new Wechat(config.wechat)

/**
 * 接收消息-普通消息 reference: https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140453
 * 接收消息-事件推送 reference: https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140454
 */
exports.reply = function *(next) {
	var message = this.weixin 

	if (message.MsgType == 'event') {
		if (message.Event === 'subscribe') {
			if (message.EventKey) {
				// TODO 尚未處理 [掃二維碼進來] 的邏輯
				console.log('掃二維碼進來' + message.EventKey + ' ' + message.ticket)
			}
			this.body = '你好，歡迎訂閱了這個號'
		} // if (message.Event === 'subscribe')
		else if (message.Event === 'unsubscribe') {
			console.log('無情取消關注')
			this.body = ''
		} // else if (message.Event === 'unsubscribe')
		else if (message.Event === 'LOCATION') { 
			this.body = '您上報的位置是： ' + message.Latitude + '/' + message.Longitude + '-' + message.Precision
		} // else if (message.Event === 'LOCATION')
		else if (message.Event === 'CLICK') {  // 點擊菜單(Menu)
			this.body = '您點擊了菜單： ' + message.EventKey
		} // else if (message.Event === 'CLICK')
		else if (message.Event === 'SCAN') {  // 掃描二維碼
			console.log('關注後掃二維碼' + message.EventKey + ' ' + message.Ticket)
			this.body = '看到您掃了二維碼'
		} // else if (message.Event === 'SCAN')
		else if (message.Event === 'VIEW') {  // 點擊菜單中的鏈接
			this.body = '您點擊了菜單中的鏈接： ' + message.EventKey
		} // if-else
	} // if (messsage.MsgType == 'event')
	else if (message.MsgType === 'text') {
		var content = message.Content
		var reply = "你說的 " + content + ' 我還沒有處理'

		// TODO Degug 用：簡易版邏輯
		if (content === '1') {
			reply = '天下第一吃大米'
		} 
		else if (content === '2') {
			reply = '天下第二吃豆腐'
		} 
		else if (content === '3') {
			reply = '天下第三吃仙丹'
		}
		else if (content === '4') {  // 測試 回覆圖文訊息
			reply = [{
				title: '自動回覆的圖文訊息',
				description: '圖文訊息的描述',
				picUrl: 'https://lintvwpri.files.wordpress.com/2017/02/pic-of-the-day-2-13.jpg?w=650',
				url: 'https://github.com'
/*			}, {
				title: 'PIC 處理器',
				description: '圖片來源：wikipedia',
				picUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Microchip_PIC24HJ32GP202.jpg/220px-Microchip_PIC24HJ32GP202.jpg',
				url: 'https://zh.wikipedia.org/zh-tw/PIC%E5%BE%AE%E6%8E%A7%E5%88%B6%E5%99%A8'
*/			}]
		}
		else if (content === '5') {  // 測試 回覆 上傳的臨時素材
			var data = yield wechatApi.uploadMaterial('image', __dirname + '/media/wechat.png')

			reply = {
				type: 'image',
				mediaId: data.media_id
			}
		} // if-else

		this.body = reply
	} // else if (message.MsgType === 'text')
	else {
		// TODO 尚未處理的 MsgType
		console.log('尚未處理的 MsgType: ' + message.MsgType)
	} // if-else (messsage.msgType)

	yield next
} // reply