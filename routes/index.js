var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
        res.render('index.html', { title : "Sample Node Express + Nunjucks app" });
});

/* GET home page. */
router.post('/', function(req, res) {
        res.render('index.html', { title : req });
});

module.exports = router;
