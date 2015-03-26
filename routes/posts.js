var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var format = require('util').format;
var async = require('async');
var weiboapi = require('./weiboapi');
 

/* GET home page. */
router.get('/', function(req, res) {
    res.redirect("/")
})

router.get('^/[0-9]+$', function(req, res) {
	var geturl = require('url').parse(req.url, true).pathname.replace('/', '');
    MongoClient.connect('mongodb://127.0.0.1:27017/weibodb', function(err, db) {
		if (err) {
			res.render("posts", {"err": "database"});
		} else {
			var collection = db.collection("users");
			collection.find({"uid":geturl}).toArray(function(err, results) {
				if(err) {
					console.log("Database Error! " + err.message);
					res.render("posts", {"err": "database"});
				} else if(results == null || results.length <= 0){
					res.render("posts", {"err": "nosuchuser"});
				} else {
					weiboapi.getWeibo(results[0].access_token, results[0].uid, 0, 0, 100, function(err, data){
						if(err) {
							res.render("posts", {"err": "weibonotreach"});
						} else {
							try {
								data = JSON.parse(data)
							} catch(err) {
								res.render("posts", {"err": "weibonotreach"});
								return;
							}
							if(typeof(data.statuses) == 'undefined'){
				    			res.render("posts", {"err": "weibonotreach"});
				    		} else {
				    			weiboapi.getUser(results[0].access_token, results[0].uid, function(err, user){
				    				if (err) {
										res.render("posts", {"err": "weibonotreach"});
									} else {
										try {
											user = JSON.parse(user)
										} catch(err) {
											res.render("posts", {"err": "weibonotreach"});
											return;
										}
										if(typeof(user.id) == 'undefined'){
											res.render("posts", {"err": "weibonotreach"});
										} else {
											var keyword = null
											weiboapi.getKeyword(data.statuses, function(err, kw){
												kw = kw.toString();
												console.log(kw);
												if(err){
													keyword = null;
												} else {
													console.log(kw.length)
													keyword = kw.split(',');
													console.log(keyword);
												}
												res.render("posts", {"err": "success", "data": data.statuses, "user": user, "keyword": keyword});
											})
										}
									}
				    			})
				    		}
						}
					})
				}
				db.close();
			});		
		}
	});
})

module.exports = router;
