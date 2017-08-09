/**
 * WeChat API 的封裝
 * start:  2017.08.08
 * update: 2017.08.09
 * version:
 *     2017.08.09 [ADD]  1st Version
 */

'use strict'

var Promise = require('bluebird')  // 使用 bluebird 提供的 Promise

// If you're using Bludbird v2
// var request = Promise.promisify(require('request'))  // 使用 bluebird 提供的 Promise 將 request Promise 化

// If you're using Bluebird v3, you'll want to use the multiArgs option:
var request = Promise.promisify(require("request"), {multiArgs: true});
Promise.promisifyAll(request, {multiArgs: true})

var fs = require('fs')
var _ = require('lodash')


var util = require('./wechat_util')

// WeChat API 網址定義
const prefix = 'https://api.weixin.qq.com/cgi-bin/'
const api = {
	// 获取access_token (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140183)
	accessToken: prefix + 'token?grant_type=client_credential',
	temporary: {
		// 臨時素材 (只保留3天) 上傳 (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738726)
		upload: prefix + 'media/upload?',
		// 臨時素材 (只保留3天) 獲取資源 (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738726)
		fetch: prefix + 'media/get?'
	},
	permanent: {
		// 永久素材 (有數量與容量限制) 上傳 (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738729)
		upload: prefix + 'material/add_material?',
		// 永久圖文素材 (有數量與容量限制) 上傳 (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738729)
		uploadNews: prefix + 'material/add_news?',
		// 上传图文消息内的图片获取URL ()https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738729)
		uploadNewsPic: prefix + 'media/uploadimg?',
		// 永久素材 獲取資源 (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738726)
		fetch: prefix + 'material/get_material?',
		// 刪除 永久素材 (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738726)
		del: prefix + 'material/del_material?',
		// 修改 永久图文素材 (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738732)
		updateNews: prefix + 'material/update_news?',
		// 获取素材总数 (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738733)
		count: prefix + 'material/get_materialcount?',
		// 获取素材列表 (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738734)
		batch: prefix + 'material/batchget_material?'
	},
	// 用户标签管理 (原本好像叫 group 用户分組管理，現在改成 tags)
	tags: {
		// 创建标签 (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140837)
		create: prefix + 'tags/create?',
		// 获取公众号已创建的标签 (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140837)
		fetch: prefix + 'tags/get?',
		// 编辑标签 (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140837)
		update: prefix + 'tags/update?',
		// 删除标签 (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140837)
		del: prefix + 'tags/delete?',
		// 获取标签下粉丝列表 (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140837)
		getUser: prefix + 'user/tag/get?',

		// TODO 用户管理 尚未完整實作
		// 批量为用户打标签 (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140837)
		batchTagging: prefix + 'tags/members/batchtagging?',
		// 批量为用户取消标签 (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140837)
		batchUnTagging: prefix + 'tags/members/batchuntagging?',
		// 获取用户身上的标签列表 (https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140837)
		getIdList: prefix + 'tags/getidlist?'

		// 舊版 API 的 Group 功能提供的
		// check: prefix + 'group/getid?',
		// move: prefix + 'group/members/update?',
		// batchUpdate: prefix + 'group/members/batchupdate?',
	}
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
	this.fetchAccessToken()
} // Wechat

/**
 * 讀取 access_token
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
Wechat.prototype.fetchAccessToken = function(data) {
	var that = this

	// 如果目前已經有合法且有效的 access_token，則直接回傳目前的 access_token
	if (this.access_token && this.expires_in) {
		if (this.isValidAccessToken(this)) {
			return Promise.resolve(this)
		}
	}

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
				return Promise.resolve(data)
			}
			else {
				// 重新更新 access_token
				return that.updateAccessToken()
			}
		})
		.then(function(data) {
			// 將 access_token 儲存到目前執行的 Global Instance 中
			that.access_token = data.access_token
			that.expires_in = data.expires_in

			// 將 access_token 儲存到實體儲存媒體中
			that.saveAccessToken(data)

			return Promise.resolve(data)
		})
} // fetchAccessToken

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

/**
 * 上傳 臨時素材 or 永久素材
 * @param  {[string]} type   臨時素材：'image' | 'voice' | 'video' | 'thumb'; 永久素材：'image' | 'video' | 'pic' | 'news'
 * 
 * @param  {[type]} material   如果是臨時素材，則傳入 filepath； 如果是永久素材，則
 * @param  {[object]} permanent  上傳永久素材的設定 (optinal for 臨時素材, 不需傳入)
 * @return {[type]}          [description]
 *
 * reference: 
 *   https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738726
 *   https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738729
 */
Wechat.prototype.uploadMaterial = function(type, material, permanent) {
	var that = this
	var form = {}
	var uploadUrl = api.temporary.upload

	if (permanent) {
		uploadUrl = api.permanent.upload

		_.extend(form, permanent)
	}

	if (type === 'pic') {
		uploadUrl = api.permanent.uploadNewsPic
	}

	if (type === 'news') {
		uploadUrl = api.permanent.uploadNews
		form = material
	}
	else {
		form.media = fs.createReadStream(material)
	}

	return new Promise(function(resolve, reject) {
		that
		  .fetchAccessToken()
		  .then(function(data) {
		  	var url = uploadUrl + 'access_token=' + data.access_token
		  	if (!permanent) {
				url += '&type=' + type
		  	}
		  	else {
		  		form.access_token = data.access_token
		  	}
			
			var options = {
				method: 'POST',
				url: url,
				json: true
			}

			if (type === 'news') {
				options.body = form
			}
			else {
				options.formData = form
			}

			// TODO ONLY for Debugging
			// console.log('url: ' + url)

			request(options)
			.then(function(response) {
				var _data = response[1]

				// TODO ONLY for Debugging
				// console.log('_data: ', _data)
				
				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Upload material fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		  }) // fetchAccessToken
	}) // return new Promise
} // uploadMaterial

/**
 * 獲取資源 臨時素材 or 永久素材
 * @param  {[type]} mediaId   Media ID
 * @param  {[string]} type   臨時素材：'image' | 'voice' | 'video' | 'thumb'; 永久素材：'image' | 'video' | 'pic' | 'news'
 * @param  {[object]} permanent  永久素材的設定 (optinal for 臨時素材, 不需傳入)
 * @return {[type]}          [description]
 *
 * reference: 
 *   https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738726
 *   https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738729
 */
Wechat.prototype.fetchMaterial = function(mediaId, type, permanent) {
	var that = this
	var form = {}
	var fetchdUrl = api.temporary.fetch

	if (permanent) {
		fetchdUrl = api.permanent.fetch
	}

	return new Promise(function(resolve, reject) {
		that
		  .fetchAccessToken()
		  .then(function(data) {
		  	var url = fetchdUrl + 'access_token=' + data.access_token + '&media_id=' + mediaId

			// TODO ONLY for Debugging
			// console.log('url: ' + url)

			var form = {}
			var options = {
				method: 'POST', 
				url: url, 
				json: true
			}

			if (permanent) {
				form.media_id = mediaId,
				form.access_token = data.access_token,
				options.body = form
			}
			else {
			  	if (type === 'video') {
			  		// 獲取資源：臨時素材 (視頻)，使用的是 http:// 而不是 https:
			  		url = url.replace('https://', 'http://')
			  	}

				url += '&media_id=' + mediaId
			}

			if (type === 'news' || type === 'video') {
				request(options)
				.then(function(response) {
					var _data = response[1]

					// TODO ONLY for Debugging
					// console.log('_data: ', _data)
					
					if (_data) {
						resolve(_data)
					}
					else {
						throw new Error('Fetch material fails')
					}
				})
				.catch(function(err) {
					reject(err)
				})
			} else {
				resolve(url)
			} // if-else
		}) // fetchAccessToken
	}) // return new Promise
} // fetchMaterial

/**
 * 刪除 永久素材
 * @param  {[type]} mediaId   永久素材 Media ID
 * @return {[type]}          [description]
 *
 * reference: 
 *   https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738731
 */
Wechat.prototype.deleteMaterial = function(mediaId) {
	var that = this
	var form = {
		media_id: mediaId
	}

	return new Promise(function(resolve, reject) {
		that
		  .fetchAccessToken()
		  .then(function(data) {
		  	var url = api.permanent.del + 'access_token=' + data.access_token + '&media_id=' + mediaId

			// TODO ONLY for Debugging
			// console.log('url: ' + url)

			request({method: 'POST', url: url, body: form, json: true})
			.then(function(response) {
				var _data = response[1]

				// TODO ONLY for Debugging
				// console.log('_data: ', _data)
				
				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Delete material fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		}) // fetchAccessToken
	}) // return new Promise
} // deleteMaterial

/**
 * 修改 永久图文素材
 * @param  {[type]} mediaId   永久圖文素材 Media ID
 * @param  {[type]} news  新的圖文素材
 * @return {[type]}          [description]
 *
 * reference: 
 *   https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738732
 */
Wechat.prototype.updateMaterial = function(mediaId, news) {
	var that = this
	var form = {
		media_id: mediaId
	}

	_.extend(form, news)

	return new Promise(function(resolve, reject) {
		that
		  .fetchAccessToken()
		  .then(function(data) {
		  	var url = api.permanent.updateNews + 'access_token=' + data.access_token + '&media_id=' + mediaId

			// TODO ONLY for Debugging
			// console.log('url: ' + url)

			request({method: 'POST', url: url, body: form, json: true})
			.then(function(response) {
				var _data = response[1]

				// TODO ONLY for Debugging
				// console.log('_data: ', _data)
				
				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Update news material fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		}) // fetchAccessToken
	}) // return new Promise
} // updateMaterial

/**
 * 获取素材总数
 * @return {[type]}          [description]
 *
 * reference: 
 *   https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738733
 */
Wechat.prototype.countMaterial = function() {
	var that = this

	return new Promise(function(resolve, reject) {
		that
		  .fetchAccessToken()
		  .then(function(data) {
		  	var url = api.permanent.count + 'access_token=' + data.access_token

			// TODO ONLY for Debugging
			// console.log('url: ' + url)

			request({method: 'GET', url: url, json: true})
			.then(function(response) {
				var _data = response[1]

				// TODO ONLY for Debugging
				// console.log('_data: ', _data)
				
				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Count material fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		}) // fetchAccessToken
	}) // return new Promise
} // countMaterial

/**
 * 获取素材列表
 * @param  {[type]} options
 * @return {[type]}          [description]
 *
 * reference: 
 *   https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1444738734
 */
Wechat.prototype.batchMaterial = function(options) {
	var that = this

	options.type = options.type || 'image'
	options.offset = options.offset || 0
	options.count = options.count || 1

	return new Promise(function(resolve, reject) {
		that
		  .fetchAccessToken()
		  .then(function(data) {
		  	var url = api.permanent.batch + 'access_token=' + data.access_token

			// TODO ONLY for Debugging
			// console.log('url: ' + url)

			request({method: 'POST', url: url, body: options, json: true})
			.then(function(response) {
				var _data = response[1]

				// TODO ONLY for Debugging
				// console.log('_data: ', _data)
				
				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Batch get material fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		}) // fetchAccessToken
	}) // return new Promise
} // batchMaterial

/**
 * 创建标签
 * @param  {[type]} name
 * @return {[type]}          [description]
 *
 * reference: 
 *   https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140837
 */
Wechat.prototype.createTag = function(name) {
	var that = this

	return new Promise(function(resolve, reject) {
		that
		  .fetchAccessToken()
		  .then(function(data) {
		  	var url = api.tags.create + 'access_token=' + data.access_token

			// TODO ONLY for Debugging
			// console.log('url: ' + url)
			
			var form = {
				"tag": {
					"name": name
				}
			}

			request({method: 'POST', url: url, body: form, json: true})
			.then(function(response) {
				var _data = response[1]

				// TODO ONLY for Debugging
				// console.log('_data: ', _data)
				
				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Create Tag fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		}) // fetchAccessToken
	}) // return new Promise
} // createTag

/**
 * 获取公众号已创建的标签
 * @return {[type]}          [description]
 *
 * reference: 
 *   https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140837
 */
Wechat.prototype.fetchTag = function() {
	var that = this

	return new Promise(function(resolve, reject) {
		that
		  .fetchAccessToken()
		  .then(function(data) {
		  	var url = api.tags.get + 'access_token=' + data.access_token

			// TODO ONLY for Debugging
			// console.log('url: ' + url)
			
			request({method: 'GET', url: url, json: true})
			.then(function(response) {
				var _data = response[1]

				// TODO ONLY for Debugging
				// console.log('_data: ', _data)
				
				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Get Tag fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		}) // fetchAccessToken
	}) // return new Promise
} // fetchTag

/**
 * 编辑标签
 * @param  {[type]} tagId
 * @param  {[type]} name
 * @return {[type]}          [description]
 *
 * reference: 
 *   https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140837
 */
Wechat.prototype.updateTag = function(tagId, name) {
	var that = this

	return new Promise(function(resolve, reject) {
		that
		  .fetchAccessToken()
		  .then(function(data) {
		  	var url = api.tags.update + 'access_token=' + data.access_token

			// TODO ONLY for Debugging
			// console.log('url: ' + url)
			
			var form = {
				"tag": {
					"id": tagId,
					"name": name
				}
			}

			request({method: 'POST', url: url, body: form, json: true})
			.then(function(response) {
				var _data = response[1]

				// TODO ONLY for Debugging
				// console.log('_data: ', _data)
				
				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Update Tag fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		}) // fetchAccessToken
	}) // return new Promise
} // updateTag

/**
 * 删除标签
 * @param  {[type]} tagId
 * @return {[type]}          [description]
 *
 * reference: 
 *   https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140837
 */
Wechat.prototype.deleteTag = function(tagId) {
	var that = this

	return new Promise(function(resolve, reject) {
		that
		  .fetchAccessToken()
		  .then(function(data) {
		  	var url = api.tags.del + 'access_token=' + data.access_token

			// TODO ONLY for Debugging
			// console.log('url: ' + url)
			
			var body = {
				"tag": {
					"id": tagId
				}
			}

			request({method: 'POST', url: url, body: body, json: true})
			.then(function(response) {
				var _data = response[1]

				// TODO ONLY for Debugging
				// console.log('_data: ', _data)
				
				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Delete Tag fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		}) // fetchAccessToken
	}) // return new Promise
} // deleteTag

/**
 * 获取标签下粉丝列表
 * @param  {[type]} tagId
 * @param  {[type]} next_openid  第一个拉取的OPENID，不填默认从头开始拉取
 * @return {[type]}          [description]
 *
 * reference: 
 *   https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140837
 */
Wechat.prototype.getTagUsers = function(tagId, next_openid) {
	var that = this

	return new Promise(function(resolve, reject) {
		that
		  .fetchAccessToken()
		  .then(function(data) {
		  	var url = api.tags.getUser + 'access_token=' + data.access_token

			// TODO ONLY for Debugging
			// console.log('url: ' + url)

			var formData = {
				"tagid": tagId,
				"next_openid": next_openid
			}
			
			request({method: 'GET', url: url, json: true})
			.then(function(response) {
				var _data = response[1]

				// TODO ONLY for Debugging
				// console.log('_data: ', _data)
				
				if (_data) {
					resolve(_data)
				}
				else {
					throw new Error('Get Tag Users fails')
				}
			})
			.catch(function(err) {
				reject(err)
			})
		}) // fetchAccessToken
	}) // return new Promise
} // getTagUsers

Wechat.prototype.reply = function() {
	var content = this.body
	var message = this.weixin
	// TODO Debug
	// console.log('content in reply: ', content)
	// console.log('message in reply: ', message)
	
	// 使用 template 產生 weixin response 所需的 xml
	var xml = util.tpl(content, message)
	// console.log('xml in reply: ', xml)

	this.status = 200
	this.type = 'application/xml'
	this.body = xml
} // reply

module.exports = Wechat
