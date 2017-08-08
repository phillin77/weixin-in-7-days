/**
 * 主程式
 * start:  2017.08.07
 * update: 2017.08.08
 * version:
 *     2017.08.08 [ADD]  1st Version
 *     
 */

'use strict'

var Koa = require('koa')
var wechat = require('./wechat/g')
var config = require('./config')
var weixin = require('./weixin')

const server_port = process.env.WECHAT_PORT || 1234

var app = new Koa()

app.use(wechat(config.wechat, weixin.reply))

app.listen(server_port)
console.log('Listening: %s', server_port)

