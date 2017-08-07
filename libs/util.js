/**
 * Utilities
 * start:  2017.08.08
 * update: 2017.08.08
 * version:
 *     2017.08.08 [ADD]  1st Version
 */

'use strict'

var fs = require('fs')
var Promise = require('bluebird')

/**
 * Read File Async
 * @param  {[type]} fpath    [description]
 * @param  {[type]} encoding [description]
 */
exports.readFileAsync = function(fpath, encoding) {
	return new Promise(function(resolve, reject) {
		fs.readFile(fpath, encoding, function(err, content) {
			if (err) reject(err)
			else resolve(content)
		})
	})
} // readFileAsync

/**
 * Write File Async
 * @param  {[type]} fpath   [description]
 * @param  {[type]} content [description]
 */
exports.writeFileAsync = function(fpath, content) {
	return new Promise(function(resolve, reject) {
		fs.writeFile(fpath, content, function(err) {
			if (err) reject(err)
			else resolve()
		})
	})
} // writeFileAsync
