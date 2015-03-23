var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var format = require('util').format;
var http = require('http')

function getWeibo(access_token, uid, since_id, max_id, count, callback){
	http.get("https://api.weibo.com/2/statuses/user_timeline.json?access_token="+access_token+"&uid="+uid+"&since_id="+since_id+"&max_id="+max_id+"&count="+count, 
			function(res) {
		console.log("Got response: " + res.statusCode);
		callback(null, res);
	}).on('error', function(e) {
		console.log("Got error: " + e.message);
		callback(e, null)
	});
}

/* GET home page. */
router.get('/', function(req, res, next) {
	getWeibo("2.005fnqRBJaaprC3c26a3e84a1RfIfB", "1179914522", 0, 0, 10, function(err, data){
		if (e) {
			res.status(err.status || 500);
			res.render('error', {
				message: err.message,
				error: {}
			});
		} else {
			data = JSON.parse(data.toString());
			res.render('index', {"data": data});
		}
	})
});

module.exports = router;
