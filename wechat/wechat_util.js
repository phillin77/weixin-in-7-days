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

function formatMessage(result) {
	var message = {}

	if (typeof result === 'object') {
		var keys = Object.keys(result)

		for (var i=0; i<keys.length; i++) {
			var item = result[keys[i]]
			var key = keys[i]

			if (!(item instanceof Array) || item.length === 0) {
				continue
			}

			if (item.length === 1) {
				var val = item[0]

				if (typeof val === 'object') {
					message[key] = formatMessage(val)
				}
				else {
					message[key] === (val || '').trim()
				}
			}
			else {
				message[key] = []

				for(var j=0, k=item.length; j<k; j++) {
					message[key].push(formatMessage(item[j]))
				}
			} // if-else
		} // for(i)
	} // if (type result === 'object')

	return message
} // formatMessage

exports.formatMessage = formatMessage
