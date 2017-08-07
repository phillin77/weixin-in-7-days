/**
 * Utilities for WeChat
 * start:  2017.08.08
 * update: 2017.08.08
 * version:
 *     2017.08.08 [ADD]  1st Version
 */

'use strict'

var xml2js = require('xml2js')
var Promise = require('bluebird')  // 使用 bluebird 提供的 Promise

exports.parseXmlAsync = function(xml) {
	return new Promise(function(resolve, reject) {
		xml2js.parseString(xml, {trim: true}, function(err, content) {
			if (err) reject(err)
			else resolve(content)
		})
	})
} // parseXmlAsync