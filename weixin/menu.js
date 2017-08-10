/**
 * 自定義菜單 設定
 * start:  2017.08.11
 * update: 2017.08.11
 * version:
 *     2017.08.11 [ADD]  1st Version
 */

'use strict'

/**
 * 自定義菜單 參考資料：
 * https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1434698695
 *
 * 設置 menu 時:
 * 	 參數中的 name, key, url 請自訂
 *   參數中的 type 請參 參考資料，並注意大小寫
 */
 module.exports = {
	'button': [{
		'name': '點擊事件',
		'type': 'click',
		'key': 'menu_click'
	}, {
		'name': '彈出菜單',
		'sub_button': [{
			'name': '跳轉URL',
			'type': 'view',
			'url': 'https://github.com'
		}, {
			'name': '掃碼推送事件,測試很長的字串',
			'type': 'scancode_push',
			'key': 'qr_scan'
		}, {
			'name': '掃碼推送中',
			'type': 'scancode_waitmsg',
			'key': 'qr_scan_wait'
		}, {
			'name': '彈出系統拍照',
			'type': 'pic_sysphoto',
			'key': 'pic_photo'
		}, {
			'name': '彈出拍照或相冊',
			'type': 'pic_photo_or_album',
			'key': 'pic_photo_or_album'
		}]
	}, {
		'name': '彈出菜單2',
		'sub_button': [{
			'name': '微信相冊發圖',
			'type': 'pic_weixin',
			'key': 'pic_weixin'
		}, {
			'name': '地理位置選擇',
			'type': 'location_select',
			'key': 'location_select'
		// }, {
		// 	'name': '下發圖片消息',
		// 	'type': 'media_id',
		// 	'media_id': '必須填入 media_id XXX'
		// }, {
		// 	'name': '跳轉圖文消息的 url',
		// 	'type': 'view_limited',
		// 	'media_id': '必須填入 media_id XXX'
		}]
	}]
} // module.exports
