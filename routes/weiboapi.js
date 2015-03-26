var https = require('https');
var http = require('http');
var bl = require('bl');

exports.getWeibo = function (access_token, uid, since_id, max_id, count, callback){
	https.get("https://api.weibo.com/2/statuses/user_timeline.json?access_token="+access_token+"&uid="+uid+"&since_id="+since_id+"&max_id="+max_id+"&count="+count, 
			function(res) {
		//console.log("Got response: " + res.statusCode);
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

exports.getKeyword = function(statuses, callback){
	var text = "";
	for (var i = 0; i < statuses.length; i++) {
		text += statuses[i].text;
	};
	//text = statuses[4].text;
	text = text.replace(/[\/:@>\]\[]/g, "");
	text = text.replace(/[a-zA-Z0-9]/g, "");
	console.log(text);
	http.get("http://api.yutao.us/api/keyword/" + text, function(res) {
		res.pipe(bl(function(err, keyword){
			if(err){
				callback(err, null);
			} else {
				console.log("keyword:"+keyword.toString());
				callback(null, keyword);
			}
		}))
	}).on('error', function(err){
		callback(err, null);
	});
}