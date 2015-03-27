var https = require('https');
var http = require('http');
var bl = require('bl');

// get weibo posts from weibo.com
exports.getWeibo = function (access_token, uid, since_id, max_id, count, callback){
	https.get("https://api.weibo.com/2/statuses/user_timeline.json?access_token="+access_token+"&uid="+uid+"&since_id="+since_id+"&max_id="+max_id+"&count="+count, 
			function(res) {
		res.pipe(bl(function(err, data){
			if (err) {
				callback(err, null);
			}else{
				callback(null, data);
			}
		}))
	}).on('error', function(err) {
		callback(err, null)
	});
}

// get user info from weibo.com
exports.getUser = function(access_token, uid, callback){
	https.get("https://api.weibo.com/2/users/show.json?access_token="+access_token+"&uid="+uid, 
			function(res) {
		res.pipe(bl(function(err, data){
			if (err) {
				callback(err, null);
			}else{
				callback(null, data);
			}
		}))
	}).on('error', function(err) {
		callback(err, null)
	});
}

// get keywords from yutao.us
exports.getKeyword = function(statuses, callback){
	var text = "";
	for (var i = 0; i < statuses.length; i++) {
		text += statuses[i].text;
	};
	text = text.replace(/[\/:@>]/g, "");
	text = text.replace(/[a-zA-Z0-9]/g, "");
	var url = "http://api.yutao.us/api/keyword/" + text;
	http.get(url, function(res) {
		res.pipe(bl(function(err, keyword){
			if(err){
				callback(err, null);
			} else {
				callback(null, keyword);
			}
		}))
	}).on('error', function(err){
		callback(err, null);
	});
}