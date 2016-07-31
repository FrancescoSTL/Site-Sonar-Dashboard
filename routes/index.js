var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

/* Import Mongo Dependencies */
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://heroku_803m4q4j:1f1t2tc0ih11omaekmln78tkcn@ds031995.mlab.com:31995/heroku_803m4q4j';

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