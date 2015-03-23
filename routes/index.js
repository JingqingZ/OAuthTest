var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var format = require('util').format;
var https = require('https');
var bl = require('bl');

function getWeibo(access_token, uid, since_id, max_id, count, callback){
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

/* GET home page. */
router.get('/', function(req, res, next) {
	getWeibo("2.005fnqRBJaaprC3c26a3e84a1RfIfB", "1179914522", 0, 0, 10, function(err, data){
		if (err) {
			res.status(err.status || 500);
			res.render('error', {
				message: err.message,
				error: {}
			});
		} else {
			//data = JSON.parse(data.toString());
			//console.log(data.toString());
			res.render('index', {"data": JSON.parse(data)});
		}
	})
});

module.exports = router;
