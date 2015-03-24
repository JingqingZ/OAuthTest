var https = require('https');
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
		//console.log("Got error: " + err.message);
		callback(err, null)
	});
}

exports.getUser = function(access_token, uid, callback){
	https.get("https://api.weibo.com/2/users/show.json?access_token="+access_token+"&uid="+uid, 
			function(res) {
		//console.log("Got user response: " + res.statusCode);
		res.pipe(bl(function(err, data){
			if (err) {
				callback(err, null);
			}else{
				callback(null, data);
			}
		}))
	}).on('error', function(err) {
		//console.log("Got error: " + err.message);
		callback(err, null)
	});
}