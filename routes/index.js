var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var format = require('util').format;
var https = require('https');
var bl = require('bl');
var async = require('async');

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
	MongoClient.connect('mongodb://127.0.0.1:27017/weibodb', function(err, db) {
		if (err) {
			res.status(err.status || 500);
			res.render('error', {
				message: err.message,
				error: {}
			});
		} else {
			var allusers = []
			var collection = db.collection('users');
			collection.find().toArray(function(err, results) {
		    	//console.dir(results);
		    	results.forEach(function(userinfo){
		    		if(typeof(userinfo.access.access_token) == 'undefined'){
		    			collection.remove(userinfo);
		    		} else {
		    			allusers[allusers.length] = userinfo;
		    			/*getWeibo(userinfo.access.access_token, userinfo.access.uid, 0, 0, 3, function(err, data){
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
						})*/
		    		}
		    	});
		        // Let's close the db 
		        db.close();
		        res.end(allusers.toString());
		        /*async.map(allusers, function(item, done){
		        	getWeibo(item.access.access_token, item.access.uid, 0, 0, 3, function(err, data){
						if (err) {
							done(err);
						} else {
							//data = JSON.parse(data.toString());
							//console.log(data.toString());
							done(null, JSON.parse(data));
							//res.render('index', {"data": JSON.parse(data)});
						}
					})
		        },
		        function(err, data){
		        	if (err) {
						res.status(err.status || 500);
						res.render('error', {
							message: err.message,
							error: {}
						});
					} else {
						res.render('index', {"data": data});
					}
		        })*/
		     });
		}
	})
	
});

module.exports = router;
