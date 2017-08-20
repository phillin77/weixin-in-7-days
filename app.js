/**
 * 主程式
 * start:  2017.08.07
 * update: 2017.08.20
 * version:
 *     2017.08.20 [ADD]  1st Version
 *     
 */

'use strict'

var Koa = require('koa')

const server_port = process.env.WECHAT_PORT || 1234

//----------------------------------
/**
 * 微信 創建 自定義菜單
 * Note: 不需每次啟動都創建 menu，只需創建一次，等下次需要更改時再重新執行即可
 */
// var menu = require('./weixin/menu')
// var wx = require('./weixin/index')
// var wechatApi = wx.getWechat();

// wechatApi.deleteMenu()
// .then(function() {
// 	return wechatApi.createMenu(menu)
// })
// .then(function(msg) {
// 	console.log('create menu: ', msg)
// })
//----------------------------------

var app = new Koa()

var path = require('path')
const static_serve = require('koa-static')  // for 靜態檔案
var Router = require('koa-router')
var router = new Router()

var movie = require('./app/controllers/jssdk_movie')
var wechat = require('./app/controllers/wechat')


//----------------------------------
// for Debugging ONLY
const logger = require('koa-logger');
app.use(logger());

//----------------------------------
// static path (/js, /css, /image)
app.use(static_serve(path.join(__dirname + '/static')))

//----------------------------------
// 設定 routers

// 設定 routers: 處理 微信 GET (簽名驗證) / POST (Message/Event)
router.get('/wx', wechat.hear)
router.post('/wx', wechat.hear)

// JS-SDK 示範頁面
router.get('/movie', movie.movie)

//----------------------------------
// 讓 routers 生效
app
  .use(router.routes())
  .use(router.allowedMethods());

//----------------------------------
// handle 404 (Page Not Found)
var pageNotFound = require('./app/controllers/pageNotFound')
app.use(pageNotFound.handle404)

//----------------------------------
// 啟動 Server
app.listen(server_port)
console.log('Listening: %s', server_port)

