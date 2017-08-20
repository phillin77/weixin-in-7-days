/**
 * 網站 router 處理 middleware for 微信 (GET / POST: 接口配置信息 URL)

 * start:  2017.08.19
 * update: 2017.08.20
 * version:
 *     2017.08.19 [ADD]  1st Version (for koa v1)
 *     2017.08.20 [EDIT] for koa v2
 */

'use strict'

var wechat = require('../../wechat/g')
var reply = require('../../weixin/reply')
var wx = require('../../weixin/index')

//----------------------------------------------
/**
 * route (Generator for koa v1)
 */
// exports.hear = function *(next) {
// 	this.middle = wechat(wx.getWechatOptions.wechat, reply.reply)

// 	yield this.middle(next)
// }

//----------------------------------------------
/**
 * route (async function for koa v2)
 */
// Note for koa v1 to koa v2:
//   1.this (in v1) => ctx (in v2)
//   2.function *(next) in v1 => async function(ctx) in v2
//   3.yield yourFunction in v1 => await yourFunction in v2
exports.hear = async function (ctx, next) {
	ctx.middle = wechat(wx.getWechatOptions.wechat, reply.reply)

	await ctx.middle(ctx, next)
}