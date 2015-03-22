var express = require('express');
var router = express.Router();
//var mongo = require('mongodb');
//var monk = require('monk');
//var db = monk('localhost:27017/userdb');
/*
router.get('/', userlist(db));

userlist = function(db){
	return function(req, res){
		var collection = db.get('usercollection');
		collection.find({},{},function(err, data){
			if (err) {
				res.status(err.status || 500);
			    res.render('error', {
			      message: err.message,
			      error: err
				});
			} else {
				res.render('userlist', {
					"userlist": data
				})
			}
		});
	};
};*/

router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        res.render('userlist', {
            "userlist" : docs
        });
    });
});

module.exports = router;
