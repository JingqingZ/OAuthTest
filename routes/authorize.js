var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var format = require('util').format;
var bl = require('bl')
var key = '2627706825'
var secret = '773eb51c7411b179002758188b92da92'
var reuri = 'zjq.101a.net/authorize/getcode'

function getAccessToken(code, callback) {

    var data = {
        "client_id": key,
        "client_secret": secret,
        "grant_type": "authorization_code",
        "redirect_uri": reuri,
        "code": code
    };

    data = require('querystring').stringify(data);
    //console.log(data);
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
    var https = require("https")
    var req = https.request(opt, function (serverFeedback) {
    	console.log("in request");
    	serverFeedback.pipe(bl(function(err, data){
    		if (err) {
                console.log('Error! Authorize feedback error!');
    			callback(null);
    		}
    		else {
    			data = data.toString();
    			data = JSON.parse(data);
                if (typeof(data.access_token) == 'undefined') {
                    console.log('Error! Get Access Token error!');
                    callback(null);
                } else {
                    //console.log(data);
                    callback(data);
                }
    		}
    	}))
    });
    req.write(data + "\n");
    req.end();
}

/* GET home page. */
router.get('/', function(req, res, next) {
	res.redirect('https://api.weibo.com/oauth2/authorize?client_id=' + key + '&response_type=code&redirect_uri=' + reuri);

});

router.get('/getcode', function(req, res){
	var geturl = require('url').parse(req.url, true)
	var code = geturl.query.code.toString()
	try{
		MongoClient.connect('mongodb://127.0.0.1:27017/weibodb', function(err, db) {
	        if(err) {
	        	throw err;
			} else {
				getAccessToken(code, function(access){
		        	if(access == null) {
		        		res.end("Error!");
		        	} else {
		        		console.log(access.toString());
			        	var collection = db.collection('users');
			        	collection.insert({"code":code, "access": access, "data": {}}, function(err, docs) {});
			        	res.end(access.toString());
		        	}
		        });
			}
	    })
	} catch (err) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: {}
		});
	}
	
})

module.exports = router;
