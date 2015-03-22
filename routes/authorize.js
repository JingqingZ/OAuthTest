var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('https://api.weibo.com/oauth2/authorize?client_id=2627706825&response_type=code&redirect_uri=zjq.101a.net/authorize/getcode');
  //secret 773eb51c7411b179002758188b92da92
});

router.get('/getcode', function(req, res){
	var geturl = require('url').parse(req.url, true)
	var code = geturl.query.code.toString()
	console.log(code);
	res.end("nothing")
})

module.exports = router;
