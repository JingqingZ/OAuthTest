var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var format = require('util').format;
 

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET Userlist page. */
router.get('/userlist', function(req, res) {
	MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
        if(err) throw err;
     
        var collection = db.collection('test_insert');
        /*collection.insert({a:2}, function(err, docs) {
            collection.count(function(err, count) {
                console.log(format("count = %s", count));
            });
        */
            // Locate all the entries using find 
            collection.find().toArray(function(err, results) {
                console.dir(results);
                // Let's close the db 
                db.close();
                res.render('userlist', {"userlist": results})
            });
        //});
    })
});

module.exports = router;
