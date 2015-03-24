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

router.get('/^[0-9]+$', function(req, res) {
    res.end("heer!")
})

module.exports = router;
