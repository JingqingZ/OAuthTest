var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var format = require('util').format;
var bl = require('bl')
var async = require('async');
var key = '2627706825'
var secret = '773eb51c7411b179002758188b92da92'
var reuri = 'zjq.101a.net/authorize/getcode'

//get access token from weibo
function getAccessToken(code, callback) {

    // create https request
    var data = {
        "client_id": key,
        "client_secret": secret,
        "grant_type": "authorization_code",
        "redirect_uri": reuri,
        "code": code
    };

    data = require('querystring').stringify(data);
    var opt = {
        method: "POST",
        host: "api.weibo.com",
        port: 443,
        path: "/oauth2/access_token",
        headers: {
            "Content-Type": 'application/x-www-form-urlencoded',
            "Content-Length": data.length
        }
    };

    //get feedback and extract data
    var https = require("https")
    var req = https.request(opt, function (serverFeedback) {
    	serverFeedback.pipe(bl(function(err, data){
    		if (err) {
                console.log('Error! Authorize feedback error!');
    			callback(null);
    		}
    		else {
    			data = data.toString();
    			try {
                    data = JSON.parse(data)
                } catch(err) {
                    callback(null);
                }
                if (typeof(data.access_token) == 'undefined') {
                    console.log('Error! Get Access Token error!');
                    callback(null);
                } else {
                    callback(data);
                }
    		}
    	}))
    });
    req.write(data + "\n");
    req.end();
}

/* GET authorize home page. */
router.get('/', function(req, res, next) {
    //redirect to weibo.com to authorize
	res.redirect('https://api.weibo.com/oauth2/authorize?client_id=' + key + '&response_type=code&redirect_uri=' + reuri);
});

router.get('/getcode', function(req, res){
    //get code from weibo.com and use the code to get access token
	var geturl = require('url').parse(req.url, true)
	var code = geturl.query.code.toString()
	getAccessToken(code, function(access){
        if(access == null) {
            res.render('authorize', {'result': "error", 'info': '无法获得授权码！'});
        } else {
            console.log(JSON.stringify(access));
            //connect to mongodb to store user access token
            MongoClient.connect('mongodb://127.0.0.1:27017/weibodb', function(err, db) {
                if(err) {
                    res.render('authorize', {'result': "error", 'info': '数据库链接失败！'});
                } else {
                    var collection = db.collection('users');
                    async.series({
                        // if current user already exists in database then remove it
                        remove: function(done){
                            collection.remove({"uid": access.uid}, function(err, docs) {
                                if(err) {
                                    console.log("Authorize Error! [Remove] "+err.message);
                                    done(err, null)
                                } else {
                                    done(null, "success")
                                }
                            });
                        },
                        // insert user info into database
                        insert: function(done){
                            collection.insert(access, function(err, docs) {
                                if(err) {
                                    console.log("Authorize Error! [Insert] "+err.message);
                                    done(err, null)
                                } else {
                                    done(null, "success")
                                }
                            });
                        }  
                    }, function(err, results){
                        if (err) {
                            res.render('authorize', {'result': "error", 'info': '数据库更新失败！'});
                        } else {
                            res.render('authorize', {'result': "success"});
                        }
                        db.close();
                    });
                }
               
            })
        }
    });
})

// if users cancel the authorization
router.get('/cancel', function(req, res, next) {
    res.render('authorize', {'result': "cancel"});
});

module.exports = router;
