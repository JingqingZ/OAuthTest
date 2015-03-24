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
	var geturl = require('url').parse(req.url, true);
    MongoClient.connect('mongodb://127.0.0.1:27017/weibodb', function(err, db) {
		if (err) {
			res.render("posts", {"err": "database"});
		} else {
			/*collection.find({"uid":}).toArray(function(err, results) {

			});*/
    		res.end(geturl);
		}
	});
})

module.exports = router;
