var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var format = require('util').format;
var async = require('async');
var weiboapi = require('./weiboapi');
 

/* GET home page. */
router.get('/', function(req, res) {
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
                    weiboapi.getUser(item.access_token, item.uid, function(err, user){
                        if (err) {
                            done(err);
                        } else {
                            user = JSON.parse(user);
                            //console.log(JSON.stringify(user));
                            done(null, user);
                        }
                    })
                },
                function(err, user){
                    if (err) {
                        res.status(err.status || 500);
                        res.render('error', {
                            message: err.message,
                            error: {}
                        });
                    } else {
                        var users = [];
                        //console.log(JSON.stringify(info[0][1]))
                        for (var i = 0; i < user.length; i++) {
                            if(user[i] == null)
                                continue;
                            users = users.concat(user[i]);
                        };
                        //res.end(JSON.stringify(stat));
                        res.render('userlist', {"userlist": users});
                    }
                    // Let's close the db 
                    db.close();
                })
             });
        }
    })
});

router.get('/^[0-9]+$', function(req, res) {
    res.end("heer!")
})

module.exports = router;
