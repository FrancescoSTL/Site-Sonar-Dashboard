var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;

/* GET home page. */
router.get('/', function(req, res) {
     res.render('index.html', { title : "Sample Node Express + Nunjucks app" });
});

/* POST for data logging to Mongo */
router.post('/log', function(req, res) {
	// TODO: parse data and send to Mongo
	var assetLoadTimes = req.body.assets;
	console.log(assetLoadTimes);
	try {
		MongoClient.connect(url, function(err, db) {
			if(err) {
				console.log("Could not connect to MongoDb " + err);
			} else {
				var benchmarkDB = db.collection('benchmark_logs');

				benchmarkDB.insertMany(assetLoadTimes).then(function(err, r) {
					if(err) {
						console.log("Could not write to databse " + err);
					} else {
						// let the client know we've received their data
			  			res.send("Data successfully recieved by Ultra-Lightbeam. Thanks :-).");
				    	db.close();
					}
				});
			}
		});
	} catch (e) {
		console.log("Could not connect to MongoDb " + e);
	}
});

module.exports = router;