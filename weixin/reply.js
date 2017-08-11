 /**
 * WeiXin 業務面處理邏輯 / Generator
 * start:  2017.08.08
 * update: 2017.08.11
 * version:
 *     2017.08.11 [ADD]  1st Version
 */

'use strict'

var path = require('path')
var config = require( path.join(__dirname, '../config') )
var Wechat = require( path.join(__dirname, '../wechat/wechat') )
var wechatApi = new Wechat(config.wechat)


// 創建 自定義菜單
// Note: 不需每次啟動都創建 menu，只需創建一次，等下次需要更改時再重新執行即可
// var menu = require('./menu')
// wechatApi.deleteMenu()
// .then(function() {
// 	return wechatApi.createMenu(menu)
// })
// .then(function(msg) {
// 	console.log('create menu: ', msg)
// })

/**
 * 接收消息-普通消息 reference: https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140453
 * 接收消息-事件推送 reference: https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140454
 */
exports.reply = function *(next) {
	var message = this.weixin 

	// Note: 不同類型的訊息的 reply 內容與 key 的名稱參：tpl.js 中 content.KEY

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
		} // else if (message.Event === 'VIEW')
		else if (message.Event === 'scancode_push') {  // 掃碼推送事件
			// 推送事件的結構參：https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141016
			console.log(message.ScanCodeInfo.ScanType)
			console.log(message.ScanCodeInfo.ScanResult)
			this.body = '您點擊了菜單中： ' + message.EventKey
		} // else if (message.Event === 'scancode_push')
		else if (message.Event === 'scancode_waitmsg') {  // 掃碼推送中
			// 推送事件的結構參：https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141016
			console.log(message.ScanCodeInfo.ScanType)
			console.log(message.ScanCodeInfo.ScanResult)
			this.body = '您點擊了菜單中： ' + message.EventKey
		} // else if (message.Event === 'scancode_waitmsg')
		else if (message.Event === 'pic_sysphoto') {  // 彈出系統拍照
			// 推送事件的結構參：https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141016
			console.log(message.SendPicsInfo.PicList)
			console.log(message.SendPicsInfo.Count)
			this.body = '您點擊了菜單中： ' + message.EventKey
		} // else if (message.Event === 'pic_sysphoto')
		else if (message.Event === 'pic_photo_or_album') {  // 彈出拍照或相冊
			// 推送事件的結構參：https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141016
			console.log(message.SendPicsInfo.PicList)
			console.log(message.SendPicsInfo.Count)
			this.body = '您點擊了菜單中： ' + message.EventKey
		} // else if (message.Event === 'pic_photo_or_album')
		else if (message.Event === 'pic_weixin') {  // 微信相冊發圖
			// 推送事件的結構參：https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141016
			console.log(message.SendPicsInfo.PicList)
			console.log(message.SendPicsInfo.Count)
			this.body = '您點擊了菜單中： ' + message.EventKey
		} // else if (message.Event === 'pic_photo_or_album')
		else if (message.Event === 'location_select') {  // 地理位置選擇
			// 推送事件的結構參：https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141016
			console.log(message.SendLocationInfo.Location_X)  // X坐标信息
			console.log(message.SendLocationInfo.Location_Y)  // Y坐标信息
			console.log(message.SendLocationInfo.Scale)  // 精度，可理解为精度或者比例尺、越精细的话 scale越高
			console.log(message.SendLocationInfo.Label)  // 地理位置的字符串信息
			console.log(message.SendLocationInfo.Poiname)  // 朋友圈POI的名字，可能为空
			this.body = '您點擊了菜單中： ' + message.EventKey
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
		else if (content === '5') {  // 測試 上傳的臨時素材 (圖片)，回覆 圖片消息
			// 必須先上傳 臨時素材 (圖片)，取得 mdeia_id
			var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../media/wechat.png'))

			reply = {
				type: 'image',
				mediaId: data.media_id
			}
		}
		else if (content === '6') {  // 測試 上傳的臨時素材 (視頻)，回覆 視頻消息
			// 必須先上傳 臨時素材 (視頻)，取得 mdeia_id
			var data = yield wechatApi.uploadMaterial('video', path.join(__dirname, '../media/charmy.mp4'))

			reply = {
				type: 'video',
				title: '回覆視頻',
				description: 'charmy',
				mediaId: data.media_id
			}
		}
		else if (content === '7') {  // 測試 上傳的臨時素材 (音樂, 封面圖)，回覆 音樂消息
			// 必須先上傳 臨時素材 (封面圖)，取得 mdeia_id
			var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../media/wechat.png'))

			reply = {
				type: 'music',
				title: '回覆音樂內容',
				description: '聽聽音樂',
				musicUrl: 'http://mpge.5nd.com/2015/2015-9-12/66325/1.mp3',
				// hqMusicUrl: '',
				thumbMediaId: data.media_id
			}
		}
		else if (content === '8') {  // 測試 上傳的永久素材 (圖片)，回覆 圖片消息
			// 必須先上傳 永久素材 (圖片)，取得 mdeia_id
			var permanent = {type: 'image'}
			var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../media/wechat.png'), permanent)

			reply = {
				type: 'image',
				mediaId: data.media_id
			}
		}
		else if (content === '9') {  // 測試 上傳的永久素材 (視頻)，回覆 視頻消息
			// 必須先上傳 永久素材 (視頻)，取得 mdeia_id
			var permanent = {
				type: 'video',
				description: '{ "title": "charmy", "introduction": "永久素材視頻 charmy"}'
			}
			var data = yield wechatApi.uploadMaterial('video', path.join(__dirname, '../media/charmy.mp4'))

			reply = {
				type: 'video',
				title: '回覆視頻',
				description: 'charmy',
				mediaId: data.media_id
			}
		}
		else if (content === '10') {  // 測試 上傳的永久素材 (圖片)，再上傳圖文消息，回覆 圖文消息
			// 必須先上傳 永久素材 (圖片)，取得 mdeia_id
			var permanent = {}
			var picData = yield wechatApi.uploadMaterial('image', path.join(__dirname, '../media/wechat.png'), permanent)

			// TODO ONLY for Debugging
			// console.log('picData: ', picData)

			var media = {
				articles: [{
					 title: 'WeChat Icon',
					 thumb_media_id: picData.media_id,
					 author: 'Me',
					 digest: '摘要',
					 show_cover_pic: 1,
					 content: '內容',
					 content_source_url: 'https://github.com'
				},{
					 title: '圖',
					 thumb_media_id: picData.media_id,
					 author: 'Me',
					 digest: '摘要',
					 show_cover_pic: 1,
					 content: '內容',
					 content_source_url: 'https://github.com'
				}]
			}

			permanent = {}
			var data = yield wechatApi.uploadMaterial('news', media, permanent)
			data = yield wechatApi.fetchMaterial(data.media_id, 'news', permanent)

			// TODO ONLY for Debugging
			// console.log('data: ', data)

			var items = data.news_item
			var news = []

			items.forEach(function(item) {
				news.push({
					title: item.title,
					decription: item.digest,
					picUrl: picData.url,
					url: item.url
				})
			})

			reply = news

			// TODO ONLY for Debugging
			// console.log('reply: ', reply)
		}
		else if (content === '11') {  // 測試 上傳的永久素材 (圖片)，再上傳圖文消息，回覆 圖文消息
			var counts = yield wechatApi.countMaterial()

			console.log("counts: ", JSON.stringify(counts))

			// var list1 = yield wechatApi.batchMaterial({
			// 	type: 'image',
			// 	offset: 0,
			// 	count: 10
			// })
			// var list2 = yield wechatApi.batchMaterial({
			// 	type: 'video',
			// 	offset: 0,
			// 	count: 10
			// })
			// var list3 = yield wechatApi.batchMaterial({
			// 	type: 'voice',
			// 	offset: 0,
			// 	count: 10
			// })
			// var list4 = yield wechatApi.batchMaterial({
			// 	type: 'news',
			// 	offset: 0,
			// 	count: 10
			// })

			// 改用 yeild 的語法完成上面 4 個 listX 讀取
			var results = yield [
				wechatApi.batchMaterial({
					type: 'image',
					offset: 0,
					count: 10
				}),
				wechatApi.batchMaterial({
					type: 'video',
					offset: 0,
					count: 10
				}),
				wechatApi.batchMaterial({
					type: 'voice',
					offset: 0,
					count: 10
				}),
				wechatApi.batchMaterial({
					type: 'news',
					offset: 0,
					count: 10
				})				
			]

			console.log( JSON.stringify(results) )

			reply = "11, 測試結果參 console.log"

		}
		else if (content === '12') {  // 測試 用户标签管理
			var name = 'wechat'
			var tag = yield wechatApi.createTag(name)
			console.log("create tag [", name, ']: ', tag)

			var tags = yield wechatApi.fetchTags()
			console.log("tags: ", tags)

			var tagList = yield wechatApi.getTagListOfUserId(message.FromUserName)
			console.log("tag list of me: ", tagList)			
				
			var tagId = 100	

			var result1 = yield wechatApi.batchTagging(tagId, [message.FromUserName])
			console.log("result of batchTagging: ", result1)

			tagList = yield wechatApi.getTagListOfUserId(message.FromUserName)
			console.log("tag list of me after batchTagging: ", tagList)			

			var result2 = yield wechatApi.batchUnTagging(tagId, [message.FromUserName])
			console.log("result of batchUpTagging: ", result2)

			tagList = yield wechatApi.getTagListOfUserId(message.FromUserName)
			console.log("tag list of me after batchUnTagging: ", tagList)			

			reply = "12, 測試結果參 console.log"
		}
		else if (content === '13') {  // 測試 获取用户基本信息（包括UnionID机制）/ 批量获取用户基本信息
			var user = yield wechatApi.fetchUsers(message.FromUserName, 'zh_CH')
			console.log(user)

			var openIds = [
				{openid: message.FromUserName, lang: 'en'}
			]
			var users = yield wechatApi.fetchUsers(openIds)

			console.log(users)

			reply = JSON.stringify(users)
		}
		else if (content === '14') {  // 測試 获取用户列表
			var userList = yield wechatApi.listUsers()
			console.log(userList)

			reply = JSON.stringify(userList)
		}
		else if (content === '15') {  // 測試 群发訊息
			var msgData
			var tagId = '100'

			// 將 User 加到 Tag 中
			// var result1 = yield wechatApi.batchTagging(tagId, [message.FromUserName])
			// console.log("result of batchTagging: ", result1)

			// 圖文訊息
			var mpnews = {
				media_id: 'B1OCpyGJkrbFRueRrzH50Idl_Qzyoz_fQwZY1WK1xmQ',
			}
			msgData = yield wechatApi.sendByTag('mpnews', mpnews, tagId)

			console.log('群發 圖文訊息 msgData', msgData)
			reply = '群發 圖文訊息 送出'

			// 文字訊息
			var text = {
				"content": 'Hello WeChat'
			}
			msgData = yield wechatApi.sendByTag('text', text, tagId)

			console.log('群發 文字訊息 msgData', msgData)
			reply = '群發 文字訊息 送出'
		}
		else if (content === '16') {  // 測試 预览接口【订阅号与服务号认证后均可用】
			var msgData
			var openId = message.FromUserName

			// 圖文訊息
			// var mpnews = {
			// 	media_id: 'B1OCpyGJkrbFRueRrzH50Idl_Qzyoz_fQwZY1WK1xmQ',
			// }
			// msgData = yield wechatApi.previewMass('mpnews', mpnews, openId)

			// console.log('預覽群發 圖文訊息 msgData', msgData)
			// reply = '預覽群發 圖文訊息 送出'

			// 文字訊息
			var text = {
				"content": 'Hello WeChat'
			}
			msgData = yield wechatApi.previewMass('text', text, openId)

			console.log('預覽群發 文字訊息 msgData', msgData)
			reply = '預覽群發 文字訊息 送出'
		}
		else if (content === '17') {  // 測試 查询群发消息发送状态【订阅号与服务号认证后均可用】
			var msgId = '6452695785753042379'
			var result = yield wechatApi.checkMass(msgId)

			console.log('群發訊息結果: ', result)
			reply = '17, 測試結果參 console.log'

		}
		else if (content === '18') {  // 測試 帳號管理 (二維碼)
			// 臨時二維碼
			var tempQRCode = {
				expire_seconds: 40000,
				action_name: 'QR_SCENE',
				action_info: {
					scene: {
						scene_id: 123
					}
				}
			}
			// 永久二維碼，傳入 场景值ID
			var permQRCode = {
				action_name: 'QR_LIMIT_SCENE',
				action_info: {
					scene: {
						scene_id: 123
					}
				}
			}
			// 永久二維碼，傳入 场景值ID（字符串形式的ID）
			var permStrQRCode = {
				action_name: 'QR_LIMIT_STR_SCENE',
				action_info: {
					scene: {
						scene_str: 'abc'
					}
				}
			}

			var qr1 = yield wechatApi.createQRCode(tempQRCode)
			var qr2 = yield wechatApi.createQRCode(permQRCode)
			var qr3 = yield wechatApi.createQRCode(permStrQRCode)

			console.log('temp. QR Code ticket: ', qr1)
			console.log('perm. QR Code ticket1: ', qr2)
			console.log('perm. QR Code ticket2: ', qr3)

			var qrcodeUrl1 = wechatApi.showQRCode(qr1.ticket)
			var qrcodeUrl2 = wechatApi.showQRCode(qr2.ticket)
			var qrcodeUrl3 = wechatApi.showQRCode(qr3.ticket)
			reply = qrcodeUrl1 + '\r\n' + qrcodeUrl2 + '\r\n' + qrcodeUrl3
		}
		else if (content === '19') {  // 測試 帳號管理 (二維碼)
			var longUrl = 'https://github.com'
			var shortData = yield wechatApi.createShortUrl(longUrl)

			console.log(shortData)
			reply = shortData.short_url
		} // if-else

		this.body = reply
	} // else if (message.MsgType === 'text')
	else {
		// TODO 尚未處理的 Incoming MsgType
		console.log('尚未處理的 Incoming MsgType: ' + message.MsgType)

		this.body = '尚未處理的 Incoming MsgType: ' + message.MsgType
	} // if-else (messsage.msgType)

	yield next
} // reply
