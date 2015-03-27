var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var format = require('util').format;
var async = require('async');
var weiboapi = require('./weiboapi');
 

/* GET home page. */
router.get('/show', function(req, res) {
    res.redirect("/")
})

// get posts of certain user(id)
function getPosts(id, callback){
	MongoClient.connect('mongodb://127.0.0.1:27017/weibodb', function(err, db) {
		if (err) {
			callback("database", null, null, null);
		} else {
			var collection = db.collection("users");
			collection.find({"uid":id}).toArray(function(err, results) {
				if(err) {
					console.log("Database Error! " + err.message);
					callback("database", null, null, null);
				} else if(results == null || results.length <= 0){
					// cannot find certain user in database
					rcallback("nosuchuser", null, null, null);
				} else {
					weiboapi.getWeibo(results[0].access_token, results[0].uid, 0, 0, 100, function(err, data){
						if(err) {
							// cannot get weibo of certain user from weibo.com
							callback("weibonotreach", null, null, null);
						} else {
							try {
								data = JSON.parse(data)
							} catch(err) {
								callback("weibonotreach", null, null, null);
								return;
							}
							if(typeof(data.statuses) == 'undefined'){
				    			callback("weibonotreach", null, null, null);
				    		} else {
				    			weiboapi.getUser(results[0].access_token, results[0].uid, function(err, user){
				    				if (err) {
										callback("weibonotreach", null, null, null);
									} else {
										try {
											user = JSON.parse(user)
										} catch(err) {
											callback("weibonotreach", null, null, null);
											return;
										}
										if(typeof(user.id) == 'undefined'){
											callback("weibonotreach", null, null, null);
										} else {
											var keyword = []
											// get keyword of recent 100 posts
											weiboapi.getKeyword(data.statuses, function(err, kw){
												kw = kw.toString();
												if(err){
													keyword = null;
												} else {
													// parse keyword
													var pos = kw.indexOf("html", 0);
													if(pos >= 0){
														keyword = null;
													} else {
														keyword = kw.split(',');
													}
												}
												callback("success", data.statuses, user, keyword);
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
}

// return webpage to show posts, user info and keywords
router.get('^/[0-9]+/show$', function(req, res) {
	var geturl = require('url').parse(req.url, true).pathname.split('/');
	geturl = geturl[1];
    getPosts(geturl, function(err, statuses, user, keyword){
    	if (err != "success") {
    		res.render("posts", {"err": err});
    	} else {
    		res.render("posts", {"err": "success", "data": statuses, "user": user, "keyword": keyword});
    	}
    })
})

// return user posts in array of JSON format
router.get('^/[0-9]+$', function(req, res) {
	var geturl = require('url').parse(req.url, true).pathname.split('/');
	geturl = geturl[1];
    getPosts(geturl, function(err, statuses, user, keyword){
    	if (err != "success") {
    		res.end({"error": err});
    	} else {
    		res.end(JSON.stringify(statuses));
    	}
    })
})

// return keywords in JSON format
router.get('^/[0-9]+/keyword$', function(req, res) {
	var geturl = require('url').parse(req.url, true).pathname.split('/');
	geturl = geturl[1];
    getPosts(geturl, function(err, statuses, user, keyword){
    	if (err != "success") {
    		res.end({"error": err});
    	} else {
    		res.end(JSON.stringify({"keyword":keyword}));
    	}
    })
})

module.exports = router;
