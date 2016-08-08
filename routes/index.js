var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

/* Import Mongo Dependencies */
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = process.env.MONGODB_URI;
var flip_nblt = 1;
var flip_nbfs = 1;
var flip_sbfs = 1;
var flip_sblt = 1;

router.get('/', function(req, res) {
  res.render('index.html');
});

/* GET home page. */
router.get('/dashboard', function(req, res) {
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

                        res.render('dashboard.html', { records : assetLoadTimes.slice(0,99), count: total, totalTime: minutesTotal});

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

/* Group ad networks by average load time. */
router.get('/networksbyloadtime', function(req,res) {

    var sort = -1;
    if (req.query.sort){
        sort = flip_nblt == 1 ? -1 : 1;
    }

    flip_nblt = sort;
    try {
        MongoClient.connect(url, function(err, db) {
            var benchmarkDB = db.collection('benchmark_logs');
            try {
                benchmarkDB.aggregate(
                    [
                        {
                            $group: {
                                _id : "$adNetwork",
                                avgLoadTime : { $avg : "$assetCompleteTime"},
                                low: { $min : "$assetCompleteTime"},
                                high: { $max : "$assetCompleteTime" },
                                count: { $sum : 1 }
                            }
                        },
                        {
                            $sort: {
                                avgLoadTime: sort
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
                                },
                                low:{
                                    $divide:[
                                        {$subtract:[
                                            {$multiply:['$low',1000]},
                                            {$mod:[{$multiply:['$low',1000]}, 1]}
                                        ]},
                                        1000
                                    ]
                                },
                                high:{
                                    $divide:[
                                        {$subtract:[
                                            {$multiply:['$high',1000]},
                                            {$mod:[{$multiply:['$high',1000]}, 1]}
                                        ]},
                                        1000
                                    ]
                                },
                                count: "$count"
                            }
                        }
                    ]
                ).toArray(function (err, avgLoadTimes){
                    benchmarkDB.find().count(function (err, total) {
                        res.render('networksbyloadtime.html', { records : avgLoadTimes.slice(0,99)});
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

/* Group host urls by average load time. */
router.get('/sitesbyloadtime', function(req,res) {

    var sort = -1;
    if (req.query.sort){
        sort = flip_sblt == 1 ? -1 : 1;
    }
    flip_sblt = sort;
    try {
        MongoClient.connect(url, function(err, db) {
            var benchmarkDB = db.collection('benchmark_logs');
            try {
                benchmarkDB.aggregate(
                    [
                        {
                            $group: {
                                _id : "$hostUrl",
                                avgLoadTime : { $avg : "$assetCompleteTime"},
                                low: { $min : "$assetCompleteTime"},
                                high: { $max : "$assetCompleteTime" },
                                count: { $sum : 1 }
                            }
                        },
                        {
                            $sort: {
                                avgLoadTime: sort
                            }
                        },
                        {
                            $project:
                            {
                                _id: "$_id",
                                hostUrl : "$hostUrl",
                                avgLoadTime:
                                {
                                    $divide:[
                                        {$subtract:[
                                            {$multiply:['$avgLoadTime',1000]},
                                            {$mod:[{$multiply:['$avgLoadTime',1000]}, 1]}
                                        ]},
                                        1000
                                    ]
                                },
                                low:{
                                    $divide:[
                                        {$subtract:[
                                            {$multiply:['$low',1000]},
                                            {$mod:[{$multiply:['$low',1000]}, 1]}
                                        ]},
                                        1000
                                    ]
                                },
                                high:{
                                    $divide:[
                                        {$subtract:[
                                            {$multiply:['$high',1000]},
                                            {$mod:[{$multiply:['$high',1000]}, 1]}
                                        ]},
                                        1000
                                    ]
                                },
                                count: "$count"
                            }
                        }
                    ]
                ).toArray(function (err, avgLoadTimes){
                    benchmarkDB.find().count(function (err, total) {
                        res.render('sitesbyloadtime.html', { records : avgLoadTimes.slice(0,99)});
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
/* Group host urls by average file sizes. */
router.get('/sitesbyfilesize', function(req,res) {

    var sort = -1;
    if (req.query.sort) {
        sort = flip_sbfs == 1 ? -1 : 1;
    }
    flip_sbfs = sort;
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
                            _id : "$hostUrl",
                            fileSize : {$avg : "$fileSize"},
                            low: { $min : "$fileSize"},
                            high: { $max : "$fileSize"},
                            count: { $sum : 1}
                        }
                    },
                    {
                        $sort: {
                            fileSize: sort
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
                                        {$multiply:["$fileSize",10]},
                                        {$mod:[{$multiply:["$fileSize",10]}, 1]}
                                    ]},
                                    10
                                ]
                            },
                            low:{
                                $divide:[
                                    {$subtract:[
                                        {$multiply:["$low",10]},
                                        {$mod:[{$multiply:["$low",10]}, 1]}
                                    ]},
                                    10
                                ]
                            },
                            high:{
                                $divide:[
                                    {$subtract:[
                                        {$multiply:["$high",10]},
                                        {$mod:[{$multiply:["$high",10]}, 1]}
                                    ]},
                                    10
                                ]
                            },
                            count:"$count"
                        }
                    }
                ]).toArray(function (err, avgLoadTimes){
                    benchmarkDB.find().count(function (err, total) {
                        res.render('sitesbyfilesize.html', { records : avgLoadTimes.slice(0,99)});
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

/* Group ad networks by average file sizes. */
router.get('/networksbyfilesize', function(req,res) {

    var sort = -1;
    if (req.query.sort) {
        sort = flip_nbfs == 1 ? -1 : 1;
    }
    flip_nbfs = sort;
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
                            fileSize : {$avg : "$fileSize"},
                            low : { $min : "$fileSize"},
                            high : { $max : "$fileSize"},
                            count : { $sum : 1 }
                        }
                    },
                    {
                        $sort: {
                            fileSize: sort
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
                                        {$multiply:["$fileSize",10]},
                                        {$mod:[{$multiply:["$fileSize",10]}, 1]}
                                    ]},
                                    10
                                ]
                            },
                            low:{
                                $divide:[
                                    {$subtract:[
                                        {$multiply:["$low",10]},
                                        {$mod:[{$multiply:["$low",10]}, 1]}
                                    ]},
                                    10
                                ]
                            },
                            high:{
                                $divide:[
                                    {$subtract:[
                                        {$multiply:["$high",10]},
                                        {$mod:[{$multiply:["$high",10]}, 1]}
                                    ]},
                                    10
                                ]
                            },
                            count:"$count"

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
