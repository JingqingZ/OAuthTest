var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('https://api.weibo.com/oauth2/authorize?client_id=2335893352&response_type=code&redirect_uri=zjq.101a.net/authorize/getcode');
});

router.get('/getcode', function(req, res){
	
})

module.exports = router;
