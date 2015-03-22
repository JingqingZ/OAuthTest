var express = require('express');
var router = express.Router();
/*var mongoose = require("mongoose");
var db = mongoose.createConnection('mongodb://127.0.0.1:27017/userdb');

// 链接错误
db.on('error', function(error) {
    console.log(error);
});

// Schema 结构
var mongooseSchema = new mongoose.Schema({
    username : {type : String, default : '匿名用户'},
    title    : {type : String},
    content  : {type : String},
    time     : {type : Date, default: Date.now},
    age      : {type : Number}
});

// 添加 mongoose 实例方法
mongooseSchema.methods.findbyusername = function(username, callback) {
    return this.model('mongoose').find({username: username}, callback);
}

// 添加 mongoose 静态方法，静态方法在Model层就能使用
mongooseSchema.statics.findbytitle = function(title, callback) {
    return this.model('mongoose').find({title: title}, callback);
}

// model
var mongooseModel = db.model('mongoose', mongooseSchema);

// 增加记录 基于 entity 操作
var doc = {username : 'jingqingz', title : 'chairman', content : 'zjq is nb', age: 20};
var mongooseEntity = new mongooseModel(doc);
mongooseEntity.save(function(error) {
    if(error) {
        console.log(error);
    } else {
        console.log('saved OK!');
    }
    // 关闭数据库链接
    db.close();
});*/

 var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;
 
  



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
