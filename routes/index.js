var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
     res.render('index.html', { title : "Sample Node Express + Nunjucks app" });
});

/* POST for data logging to Mongo */
router.post('/log', function(req, res) {
	// TODO: parse data and send to Mongo
	var assetLoadTimes = req.body;
	console.log(assetLoadTimes);
	MongoClient.connect(url, function(err, db) {
		var benchmarkDB = db.collection('benchmark_logs');

		benchmarkDB.insertMany(assetLoadTimes.assets, function() {
			// let the client know we've received their data
  			res.send("Data successfully recieved by Ultra-Lightbeam. Thanks :-).");
	    	db.close();
		});
	});
});

module.exports = router;
