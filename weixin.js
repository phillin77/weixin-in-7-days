/**
 * WeiXin 業務面處理邏輯 / Generator
 * start:  2017.08.08
 * update: 2017.08.08
 * version:
 *     2017.08.08 [ADD]  1st Version
 */

'use strict'

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

			this.body = '你訂閱了這個號'
		}
		else if (message.Event === 'unsubscribe') {
			console.log('無情取消關注')

			this.body = ''
		} // if-else

	} // if (messsage.msgType == 'event')
	else {

	} // if-else (messsage.msgType)

	yield next
} // reply