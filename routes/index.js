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
			// get info of all users in database
			collection.find().toArray(function(err, results) {
				// remove users that can not get access token
		    	results.forEach(function(userinfo){
		    		if(typeof(userinfo.access_token) == 'undefined'){
		    			collection.remove(userinfo);
		    		} else {
		    			allusers[allusers.length] = userinfo;
		    		}
		    	});
		    	// get weibo of all legal users from weibo.com
		        async.map(allusers, function(item, done){
		        	weiboapi.getWeibo(item.access_token, item.uid, 0, 0, 10, function(err, data){
						if (err) {
							done(err);
						} else {
							try {
								data = JSON.parse(data)
							} catch(err) {
								done(err);
							}
							// remove users that cancelled authorization
							if(typeof(data.statuses) == 'undefined'){
				    			collection.remove({"access_token": item.access_token}, function(err, docs) {});
				    			done(null, [null, null]);
				    		} else {
				    			// get user info from weibo.com
				    			weiboapi.getUser(item.access_token, item.uid, function(err, user){
				    				if (err) {
										done(err);
									} else {
										try {
											user = JSON.parse(user);
										} catch(err) {
											done(err);
										}
										done(null, [data, user]);
									}
				    			})
				    		}
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
						// parse all data, including weibo and user info
						var stat = [], users = [];
						for (var i = 0; i < info.length; i++) {
							if(info[i][0] == null)
								continue;
							stat = stat.concat(info[i][0].statuses);
							users = users.concat(info[i][1]);
						};
						stat.sort(function(x, y){
							var datex = new Date(x.created_at);
							var datey = new Date(y.created_at);
							datex = Date.UTC(datex.getFullYear(),datex.getMonth(),datex.getDate(),datex.getHours(),datex.getMinutes(),datex.getSeconds());
							datey = Date.UTC(datey.getFullYear(),datey.getMonth(),datey.getDate(),datey.getHours(),datey.getMinutes(),datey.getSeconds());
							if(datex > datey) {
								return -1;
							}
							else {
								return 1;
							}
						})
						res.render('index', {"data": stat, "users": users});
					}
		        	// close the db 
					db.close();
		        })
		     });
		}
	})
	
});

module.exports = router;
