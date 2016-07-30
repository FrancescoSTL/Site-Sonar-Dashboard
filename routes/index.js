var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
        res.render('index.html', { title : "Sample Node Express + Nunjucks app" });
});

/* POST home page. */
router.post('/', function(req, res) {
	console.log(req.body);
    res.send("Data logged successfully to server.");
});

module.exports = router;
