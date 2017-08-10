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
var config = require('./config.js')
var reply = require('./weixin/reply')

const server_port = process.env.WECHAT_PORT || 1234

var app = new Koa()

app.use(wechat(config.wechat, reply.reply))

app.listen(server_port)
console.log('Listening: %s', server_port)

