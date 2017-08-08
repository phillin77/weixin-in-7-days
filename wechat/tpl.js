/**
 * Template of Messages
 * start:  2017.08.08
 * update: 2017.08.08
 * version:
 *     2017.08.08 [ADD]  1st Version
 */

'use strict'

var ejs = require('ejs')
var heredoc = require('heredoc')


/**
 * Note: heredoc 的使用，
 * 將 template 的字串包在 '/* * /' 註解符號中
 * template 的語法包在 <% %> 裡面
 * 字串取代用： <%= 變數名稱 %>
 *
 * weixin response xml reference: https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140543
 */
var tpl = heredoc(function() {/*
	<xml>
	<ToUserName><![CDATA[<%= toUserName %>]]></ToUserName>
	<FromUserName><![CDATA[<%= fromUserName %>]]></FromUserName>
	<CreateTime><%= createTime %></CreateTime>
	<MsgType><![CDATA[<%= msgType %>]]></MsgType>
	<% if (msgType === 'text') { %>
		<Content><![CDATA[<%= content %>]]></Content>
	<% } else if (msgType === 'image') { %> 
		<Image>
			<MediaId><![CDATA[<%= content.media_id %>]]></MediaId>
		</Image>
	<% } else if (msgType === 'voice') { %> 
		<Voice>
			<MediaId><![CDATA[<%= content.media_id %>]]></MediaId>
		</Voice>
	<% } else if (msgType === 'video') { %> 
		<Video>
			<MediaId><![CDATA[<%= content.media_id %>]]></MediaId>
			<Title><![CDATA[<%= content.title %>]]></Title>
			<Description><![CDATA[<%= content.description %>]]></Description>
		</Video> 		
	<% } else if (msgType === 'music') { %> 
		<Music>
			<Title><![CDATA[<%= content.title %>]]></Title>
			<Description><![CDATA[<%= content.description %>]]></Description>
			<MusicUrl><![CDATA[<%= content.musicUrl %>]]></MusicUrl>
			<HQMusicUrl><![CDATA[<%= content.hqMusicUrl %>]]></HQMusicUrl>
			<ThumbMediaId><![CDATA[<%= content.thumbMediaId %>]]></ThumbMediaId>
		</Music>		
	<% } else if (msgType === 'news') { %> 
		<ArticleCount><%= content.length %></ArticleCount>
		<Articles>
		<% content.forEach(function(item) {%>
			<item>
			<Title><![CDATA[<%= item.title %>]]></Title> 
			<Description><![CDATA[<%= item.description %>]]></Description>
			<PicUrl><![CDATA[<%= item.picUrl %>]]></PicUrl>
			<Url><![CDATA[<%= item.url %>]]></Url>
			</item>
		<% }) %>
		</Articles>		
	<% } %>
	</xml>
*/}) // tpl

var compiled = ejs.compile(tpl)

exports = module.exports = {
	compiled: compiled
}

