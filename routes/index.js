var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var format = require('util').format;
var https = require('https');
var bl = require('bl');
var async = require('async');
var weiboapi = require('./weiboapi');

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
		        	weiboapi.getWeibo(item.access_token, item.uid, 0, 0, 3, function(err, data){
						if (err) {
							done(err);
						} else {
							//data = JSON.parse(data.toString());
							//console.log(data.toString());
							data = JSON.parse(data)
							if(typeof(data.statuses) == 'undefined'){
				    			collection.remove({"access_token": item.access_token}, function(err, docs) {});
				    			done(null, [null, null]);
				    		} else {
				    			weiboapi.getUser(item.access_token, item.uid, function(err, user){
				    				if (err) {
										done(err);
									} else {
										user = JSON.parse(user);
										//console.log(JSON.stringify(user));
										done(null, [data, user]);
									}
				    			})
				    		}
							//res.render('index', {"data": JSON.parse(data)});
						}
					})
		        },
		        function(err, info){
		        	if (err) {
						res.status(err.status || 500);
						res.render('error', {
							message: err.message,
							error: {}
						});
					} else {
						var stat = [], users = [];
						//console.log(JSON.stringify(info[0][1]))
						for (var i = 0; i < info.length; i++) {
							if(info[i][0] == null)
								continue;
							stat = stat.concat(info[i][0].statuses);
							users = users.concat(info[i][1]);
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
