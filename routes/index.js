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
	try {
		MongoClient.connect(url, function(err, db) {
			var benchmarkDB = db.collection('benchmark_logs');

			try {
				benchmarkDB.find({},{sort: {assetCompleteTime: -1}}).toArray(function(err, assetLoadTimes) {
					benchmarkDB.find().count(function (err, total) {
						var millisecondTotal = 0;
						for (var record in assetLoadTimes) {
							millisecondTotal += parseInt(record);
						}

						// calculate our total processing time in minutes, and round to 2 decimal places
						var minutesTotal = Math.round((millisecondTotal * .000016667) * 100) / 100;

						res.render('index.html', { records : assetLoadTimes.slice(0,99), count: total, totalTime: minutesTotal});

						db.close();
					});
				});
			} catch (e) {
					console.log("Could not find records in database " + e);
			}
		});
	} catch (e) {
		console.log("Could not connect to MongoDb " + e);
	}
});

/* POST for data logging to Mongo */
router.post('/log', function(req, res) {
	// TODO: parse data and send to Mongo
	var assetLoadTimes = req.body.assets;
	try {
		MongoClient.connect(url, function(err, db) {
			if(err) {
				console.log("Could not connect to MongoDb " + err);
			} else {
				var benchmarkDB = db.collection('benchmark_logs');

				try {
					benchmarkDB.insertMany(assetLoadTimes).then(function(r) {
						// let the client know we've received their data
				  		res.send("Data successfully recieved by Ultra-Lightbeam. Thanks :-).");
					    db.close();
					});
				} catch (e) {
					console.log("Could not log to database " + e);
				}
			}
		});
	} catch (e) {
		console.log("Could not connect to MongoDb " + e);
	}
});

module.exports = router;