var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

/* Import Mongo Dependencies */
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = process.env.MONGODB_URI;

router.get('/home', function(req, res) {
  res.render('landing.html');
});

/* GET home page. */
router.get('/', function(req, res) {
    try {
        MongoClient.connect(url, function(err, db) {
            var benchmarkDB = db.collection('benchmark_logs');

            try {
                benchmarkDB.find({}, {sort: {timeStamp: -1}}).toArray(function(err, assetLoadTimes) {
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

/* Group by ad networks display. */
router.get('/timeByAdNetwork', function(req,res) {
    try {
        MongoClient.connect(url, function(err, db) {
            var benchmarkDB = db.collection('benchmark_logs');
            try {
                benchmarkDB.aggregate(
                    [
                        {
                            $group: {
                                _id : "$adNetwork",
                                avgLoadTime : { $avg : "$assetCompleteTime"}
                            }
                        },
                        {
                            $sort: {
                                avgLoadTime: -1
                            }
                        },
                        {
                            $project:
                            {
                                _id: "$_id",
                                adNetwork : "$adNetwork",
                                avgLoadTime:
                                {
                                    $divide:[
                                        {$subtract:[
                                            {$multiply:['$avgLoadTime',1000]},
                                            {$mod:[{$multiply:['$avgLoadTime',1000]}, 1]}
                                        ]},
                                        1000
                                    ]
                                }
                            }
                        }
                    ]
                ).toArray(function (err, avgLoadTimes){
                    benchmarkDB.find().count(function (err, total) {
                        res.render('timeByAdNetwork.html', { records : avgLoadTimes.slice(0,99)});
                        db.close();
                    });
                });
            } catch (e) {
                console.log("Could not connect to MongoDb " + e);
            }
        });
    } catch (e) {
        console.log("Could not connect to MongoDb " + e) ;
    }
});

/* Group by ad networks display. */
router.get('/recordsbyfilesize', function(req,res) {
    try {
        MongoClient.connect(url, function(err, db) {
            var benchmarkDB = db.collection('benchmark_logs');
            try {
                benchmarkDB.aggregate(
                    [
                        {
                            $group: {
                                _id : "$adNetworkUrl",
                                avgLoadTime : { $avg : "$assetCompleteTime"}
                            }
                        },
                        {
                            $sort: {
                                avgLoadTime: -1
                            }
                        },
                        {
                            $project:
                            {
                                _id: "$_id",
                                avgLoadTime:
                                {
                                    $divide:[
                                        {$subtract:[
                                            {$multiply:['$avgLoadTime',1000]},
                                            {$mod:[{$multiply:['$avgLoadTime',1000]}, 1]}
                                        ]},
                                        1000
                                    ]
                                }
                            }
                        }
                    ]
                ).toArray(function (err, avgLoadTimes){
                    benchmarkDB.find().count(function (err, total) {
                        res.render('recordsbyfilesize.html', { records : avgLoadTimes.slice(0,99)});
                        db.close();
                    });
                });
            } catch (e) {
                console.log("Could not connect to MongoDb " + e);
            }
        });
    } catch (e) {
        console.log("Could not connect to MongoDb " + e) ;
    }
});

/* Group by ad networks display. */
router.get('/networksbyfilesize', function(req,res) {
    try {
        MongoClient.connect(url, function(err, db) {
            var benchmarkDB = db.collection('benchmark_logs');
            try {
                benchmarkDB.aggregate([
                    {
                        $match: {
                            "fileSize" : { "$exists" : true, "$ne": null}
                        }
                    },
                    {
                        $group: {
                            _id : "$adNetwork",
                            fileSize : { $avg : "$fileSize"}
                        }
                    },
                    {
                        $sort: {
                            fileSize: -1
                        }
                    },
                    {
                        $project:
                        {
                            _id: "$_id",
                            fileSize:
                            {
                                $divide:[
                                    {$subtract:[
                                        {$multiply:['$fileSize',1000]},
                                        {$mod:[{$multiply:['$fileSize',1000]}, 1]}
                                    ]},
                                    1000
                                ]
                            }
                        }
                    }
                ]).toArray(function (err, fileSizes){
                    benchmarkDB.find().count(function (err, total) {
                        res.render('networksbyfilesize.html', { records : fileSizes.slice(0,99)});
                        db.close();
                    });
                });
            } catch (e) {
                console.log("Could not connect to MongoDb " + e);
            }
        });
    } catch (e) {
        console.log("Could not connect to MongoDb " + e) ;
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
