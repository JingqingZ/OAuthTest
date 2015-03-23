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

function getUser(access_token, uid, callback){
	https.get("https://api.weibo.com/2/users/show.json?access_token="+access_token+"&uid="+uid, 
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
		    		if(typeof(userinfo.access_token) == 'undefined'){
		    			collection.remove(userinfo);
		    		} else {
		    			allusers[allusers.length] = userinfo;
		    		}
		    	});
		        //res.end(JSON.stringify(allusers));
		        async.map(allusers, function(item, done){
		        	getWeibo(item.access_token, item.uid, 0, 0, 3, function(err, data){
						if (err) {
							done(err);
						} else {
							//data = JSON.parse(data.toString());
							//console.log(data.toString());
							data = JSON.parse(data)
							if(typeof(data.statuses) == 'undefined'){
				    			collection.remove({"access_token": item.access_token}, function(err, docs) {});
				    			done(null, null, null);
				    		} else {
				    			getUser(item.access_token, item.uid, function(err, user){
				    				if (err) {
										done(err);
									} else {
										user = JSON.parse(user);
										done(null, data, user);
									}
				    			})
				    		}
							//res.render('index', {"data": JSON.parse(data)});
						}
					})
		        },
		        function(err, data, user){
		        	if (err) {
						res.status(err.status || 500);
						res.render('error', {
							message: err.message,
							error: {}
						});
					} else {
						var stat = [], users = [];
						console.log(JSON.stringify(user))
						for (var i = 0; i < data.length; i++) {
							if(data[i] == null)
								continue;
							stat = stat.concat(data[i].statuses);
							//users = users.concat(user[i]);
						};
						//res.end(JSON.stringify(stat));
						res.render('index', {"data": stat, "users": users});
					}
		        	// Let's close the db 
					db.close();
		        })
		     });
		}
	})
	
});

module.exports = router;
