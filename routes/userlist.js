var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var format = require('util').format;
var async = require('async');
var weiboapi = require('./weiboapi');

// get users info from weibo.com
function getUsersInfo(callback){
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
                // get all legal users from databse
                results.forEach(function(userinfo){
                    if(typeof(userinfo.access_token) == 'undefined'){
                        collection.remove(userinfo);
                    } else {
                        allusers[allusers.length] = userinfo;
                    }
                });
                async.map(allusers, function(item, done){
                    weiboapi.getUser(item.access_token, item.uid, function(err, user){
                        if (err) {
                            done(err);
                        } else {
                            try {
                                user = JSON.parse(user)
                            } catch(err) {
                                done(err);
                            }
                            if(typeof(user.id) == 'undefined'){
                                done(null, null)
                            } else {
                                done(null, user);
                            }
                        }
                    })
                },
                function(err, user){
                    callback(err, user);
                    // close the db 
                    db.close();
                })
             });
        }
    })
}

// return webpage to show all users
router.get('/show', function(req, res) {
	getUsersInfo(function(err, user){
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
    })
});

// return all users info in array of JSON format
router.get('/', function(req, res) {
    getUsersInfo(function(err, user){
        if (err) {
            res.end({"error": err.message});
        } else {
            var users = [];
            //console.log(JSON.stringify(info[0][1]))
            for (var i = 0; i < user.length; i++) {
                if(user[i] == null)
                    continue;
                users = users.concat(user[i]);
            };
            res.end(JSON.stringify(users));
        }
    })
});

module.exports = router;
