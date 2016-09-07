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

    try{
        MongoClient.connect(url, function(err,db){
            if(err!=null){
                res.render("error.html");
                return;
            }
            var benchmarkDB = db.collection('benchmark_logs');
            try{

                benchmarkDB.aggregate([
                    {
                        $group: {
                            _id: null,
                            fileSizes: { $sum: "$fileSize"},
                            loadTimes: { $sum: "$assetCompleteTime"},
                            assets: { $sum: 1}
                        }
                    }
                ]).toArray(function(err,counts){
                    if(err!=null){
                        res.render("error.html");
                        return;
                    }
                    var summary = counts[0];
                    var assets = summary.assets;
                    var loadTimes = formatMillseconds(summary.loadTimes,1);
                    var fileSizes = formatBytes(summary.fileSizes,1);

                    res.render("dashboard.html", {
                        "assets" : assets,
                        "fileSizes": fileSizes,
                        "loadTimes" : loadTimes
                    })
                });
            } catch(e){
                console.log("Exception connecting to MongoDB");
            }
        });
    } catch(e){
        console.log("Exception connecting to MongoDB");
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
            if(err!=null){

                console.log(err);
                res.render("error.html");
                return;
            }
            var benchmarkDB = db.collection('benchmark_logs');
            try {
                benchmarkDB.aggregate([
                    {
                        $group: {
                            _id: "$adNetwork",
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { count: 1 }
                    }
                    ]).toArray( function (err, averageCount){
                        if(err!=null){

                            console.log(err);
                            res.render("error.html");
                            return;
                        }
                        var size = averageCount.length;
                        var median = Math.floor(size/4);
                        var filter = averageCount[median]!=null? averageCount[median].count : 0;

                        benchmarkDB.aggregate([
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
                                    avgLoadTime: -sort
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
                                                {$multiply:['$avgLoadTime',10]},
                                                {$mod:[{$multiply:['$avgLoadTime',10]}, 1]}
                                            ]},
                                            10
                                        ]
                                    },
                                    low:{
                                        $divide:[
                                            {$subtract:[
                                                {$multiply:['$low',10]},
                                                {$mod:[{$multiply:['$low',10]}, 1]}
                                            ]},
                                            10
                                        ]
                                    },
                                    high:{
                                        $divide:[
                                            {$subtract:[
                                                {$multiply:['$high',10]},
                                                {$mod:[{$multiply:['$high',10]}, 1]}
                                            ]},
                                            10
                                        ]
                                    },
                                    count: "$count"
                                }
                            },
                            {
                                $match: {
                                    "count" : { "$gt" : filter}
                                }
                            },
                            {
                                $limit: 100
                            }
                        ]).toArray(function (err, avgLoadTimes){
                            if(err!=null){

                                console.log(err);
                                res.render("error.html");
                                return;
                            }
                            benchmarkDB.find().count(function (err, total) {
                                res.render('networksbyloadtime.html', { records : avgLoadTimes});
                                db.close();
                            });
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
            if(err!=null){

                console.log(err);
                res.render("error.html");
                return;
            }
            var benchmarkDB = db.collection('benchmark_logs');
            try {
                benchmarkDB.aggregate([
                    {
                        $group: {
                            _id: "$hostUrl",
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { count: 1 }
                    }
                ]).toArray( function (err, averageCount){
                    if(err!=null){

                        console.log(err);
                        res.render("error.html");
                        return;
                    }
                    var size = averageCount.length;
                    var median = Math.floor(size/4);
                    var filter = averageCount[median]!=null? averageCount[median].count : 0;

                    benchmarkDB.aggregate([
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
                                avgLoadTime: -sort
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
                                            {$multiply:['$avgLoadTime',10]},
                                            {$mod:[{$multiply:['$avgLoadTime',10]}, 1]}
                                        ]},
                                        10
                                    ]
                                },
                                low:{
                                    $divide:[
                                        {$subtract:[
                                            {$multiply:['$low',10]},
                                            {$mod:[{$multiply:['$low',10]}, 1]}
                                        ]},
                                        10
                                    ]
                                },
                                high:{
                                    $divide:[
                                        {$subtract:[
                                            {$multiply:['$high',10]},
                                            {$mod:[{$multiply:['$high',10]}, 1]}
                                        ]},
                                        10
                                    ]
                                },
                                count: "$count"
                            }
                        },
                        {
                            $match: {
                                "count" : { "$gt" : filter}
                            }
                        },
                        {
                            $limit: 100
                        }
                    ]).toArray(function (err, avgLoadTimes){
                        if(err!=null){

                            console.log(err);
                            res.render("error.html");
                            return;
                        }
                        benchmarkDB.find().count(function (err, total) {
                            if(err!=null){

                                console.log(err);
                                res.render("error.html");
                                return;
                            }
                            res.render('sitesbyloadtime.html', { records : avgLoadTimes});
                            db.close();
                        });
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
            if(err!=null){

                console.log(err);
                res.render("error.html");
                return;
            }
            var benchmarkDB = db.collection('benchmark_logs');
            try {
                benchmarkDB.aggregate([
                    {
                        $group: {
                            _id: "$hostUrl",
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { count: 1 }
                    }
                ]).toArray( function (err, averageCount) {
                    if(err!=null){

                        console.log(err);
                        res.render("error.html");
                        return;
                    }
                    var size = averageCount.length;
                    var median = Math.floor(size / 4);
                    var filter = averageCount[median]!=null? averageCount[median].count : 0;

                    benchmarkDB.aggregate([
                        {
                            $match: {
                                "fileSize": {"$exists": true, "$ne": null}
                            }
                        },
                        {
                            $group: {
                                _id: "$hostUrl",
                                fileSize: {$avg: "$fileSize"},
                                low: {$min: "$fileSize"},
                                high: {$max: "$fileSize"},
                                count: {$sum: 1}
                            }
                        },
                        {
                            $sort: {
                                fileSize: -sort
                            }
                        },
                        {
                            $project: {
                                _id: "$_id",
                                fileSize: {
                                    $divide: [
                                        {
                                            $subtract: [
                                                {$multiply: ["$fileSize", 10]},
                                                {$mod: [{$multiply: ["$fileSize", 10]}, 1]}
                                            ]
                                        },
                                        10
                                    ]
                                },
                                low: {
                                    $divide: [
                                        {
                                            $subtract: [
                                                {$multiply: ["$low", 10]},
                                                {$mod: [{$multiply: ["$low", 10]}, 1]}
                                            ]
                                        },
                                        10
                                    ]
                                },
                                high: {
                                    $divide: [
                                        {
                                            $subtract: [
                                                {$multiply: ["$high", 10]},
                                                {$mod: [{$multiply: ["$high", 10]}, 1]}
                                            ]
                                        },
                                        10
                                    ]
                                },
                                count: "$count"
                            },
                        },
                        {
                            $match: {
                                "count" : { "$gt" : filter}
                            }
                        },
                        {
                            $limit: 100
                        }
                    ]).toArray(function (err, avgLoadTimes) {
                        if(err!=null){

                            console.log(err);
                            res.render("error.html");
                            return;
                        }
                        benchmarkDB.find().count(function (err, total) {
                            if(err!=null){

                                console.log(err);
                                res.render("error.html");
                                return;
                            }
                            res.render('sitesbyfilesize.html', {records: avgLoadTimes});
                            db.close();
                        });
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
            if(err!=null){

                console.log(err);
                res.render("error.html");
                return;
            }
            var benchmarkDB = db.collection('benchmark_logs');
            try {
                benchmarkDB.aggregate([
                    {
                        $group: {
                            _id: "$adNetwork",
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { count: 1 }
                    }
                ]).toArray( function (err, averageCount) {
                    if(err!=null){

                        console.log(err);
                        res.render("error.html");
                        return;
                    }
                    var size = averageCount.length;
                    var median = Math.floor(size / 4);
                    var filter = averageCount[median]!=null? averageCount[median].count : 0;

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
                                fileSize: -sort
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
                        },
                        {
                            $match: {
                                "count" : { "$gt" : filter}
                            }
                        },
                        {
                            $limit: 100
                        }
                    ]).toArray(function (err, fileSizes){
                        if(err!=null){

                            console.log(err);
                            res.render("error.html");
                            return;
                        }
                        benchmarkDB.find().count(function (err, total) {
                            if(err!=null){

                                console.log(err);
                                res.render("error.html");
                                return;
                            }
                            res.render('networksbyfilesize.html', { records : fileSizes});
                            db.close();
                        });
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

/* Histograms for networks - load time and file size.*/
router.get('/networkstats', function(req, res){
    var network = req.query.network;

    try {
        MongoClient.connect(url, function(err, db) {
            if(err!=null){

                console.log(err);
                res.render("error.html");
                return;
            }
            var benchmarkDB = db.collection('benchmark_logs');
            try {
                /* Histogram stats*/
                benchmarkDB.aggregate([
                    {
                        $match: {
                            "adNetwork" : network,
                            "fileSize" : { "$exists" : true, "$ne": null}
                        }
                    },
                    {
                        $project : {
                            _id: "$originUrl",
                            fileSize: "$fileSize",
                            loadTime: "$assetCompleteTime"
                        }
                    }
                ]).toArray(function (err, recordsForNetwork){
                    if(err!=null){

                        console.log(err);
                        res.render("error.html");
                        return;
                    }
                    /* Asset type classification*/
                        benchmarkDB.aggregate([
                            {
                                $match: {
                                    "adNetwork" : network,
                                    "fileSize" : { "$exists" : true, "$ne": null}
                                }
                            },
                            {
                                $group: {
                                    _id: "$assetType",
                                    count: {$sum: 1},
                                    averageFileSize: {$avg : "$fileSize"},
                                    averageLoadTime: {$avg: "$assetCompleteTime"}


                                }
                            },
                            {
                                $project:
                                {
                                    _id: "$_id",
                                    averageFileSize:
                                    {
                                        $divide:[
                                            {$subtract:[
                                                {$multiply:["$averageFileSize",10]},
                                                {$mod:[{$multiply:["$averageFileSize",10]}, 1]}
                                            ]},
                                            10
                                        ]
                                    },
                                    averageLoadTime:{
                                        $divide:[
                                            {$subtract:[
                                                {$multiply:["$averageLoadTime",10]},
                                                {$mod:[{$multiply:["$averageLoadTime",10]}, 1]}
                                            ]},
                                            10
                                        ]
                                    },
                                    count:"$count"

                                }
                            },
                            {
                                $sort : { count : -1 }
                            }
                        ]).toArray(function (err, assetTypes){
                            if(err!=null){

                                console.log(err);
                                res.render("error.html");
                                return;
                            }
                            /* Top level stats*/
                            benchmarkDB.aggregate([
                                {
                                    $match: {
                                        "fileSize" : { "$exists" : true, "$ne": null}
                                    }
                                },
                                {
                                    $group: {
                                        _id: "$adNetwork",
                                        count: {$sum: 1},
                                        averageFileSize: {$avg : "$fileSize"},
                                        averageLoadTime: {$avg: "$assetCompleteTime"}
                                    }
                                },
                                {
                                    $project:
                                    {
                                        _id: "$_id",
                                        averageFileSize:
                                        {
                                            $divide:[
                                                {$subtract:[
                                                    {$multiply:["$averageFileSize",10]},
                                                    {$mod:[{$multiply:["$averageFileSize",10]}, 1]}
                                                ]},
                                                10
                                            ]
                                        },
                                        averageLoadTime:{
                                            $divide:[
                                                {$subtract:[
                                                    {$multiply:["$averageLoadTime",10]},
                                                    {$mod:[{$multiply:["$averageLoadTime",10]}, 1]}
                                                ]},
                                                10
                                            ]
                                        },
                                        count:"$count"

                                    }
                                },
                                {
                                    $match : {
                                        "_id" : network
                                    }
                                }

                            ]).toArray(function(err,overall ){
                                if(err!=null){

                                    console.log(err);
                                    res.render("error.html");
                                    return;
                                }
                                res.render('networkstats.html', {
                                    overall: overall,
                                    records : recordsForNetwork,
                                    network : network,
                                    assetTypes: assetTypes
                                });
                                db.close();
                            });
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

/* Sites page */
router.get('/sitestats', function(req, res){
    var site = req.query.site;
    try {
        MongoClient.connect(url, function(err, db) {
            if(err!=null){

                console.log(err);
                res.render("error.html");
                return;
            }
            var benchmarkDB = db.collection('benchmark_logs');
            try {
                benchmarkDB.aggregate([
                    {
                        $match: {
                            "originUrl" : site,
                            "fileSize" : { "$exists" : true, "$ne": null}
                        }
                    },
                    {
                        $project : {
                            _id: "$originUrl",
                            fileSize: "$fileSize",
                            loadTime: "$assetCompleteTime"
                        }
                    }
                ]).toArray(function (err, recordsForSite){
                    if(err!=null){

                        console.log(err);
                        res.render("error.html");
                        return;
                    }
                    benchmarkDB.aggregate([
                        {
                            $match: {
                                "originUrl" : site,
                                "fileSize" : { "$exists" : true, "$ne": null}
                            }
                        },
                        {
                            $group: {
                                _id: "$assetType",
                                count: {$sum: 1},
                                averageFileSize: {$avg : "$fileSize"},
                                averageLoadTime: {$avg: "$assetCompleteTime"}


                            }
                        },
                        {
                            $project:
                            {
                                _id: "$_id",
                                averageFileSize:
                                {
                                    $divide:[
                                        {$subtract:[
                                            {$multiply:["$averageFileSize",10]},
                                            {$mod:[{$multiply:["$averageFileSize",10]}, 1]}
                                        ]},
                                        10
                                    ]
                                },
                                averageLoadTime:{
                                    $divide:[
                                        {$subtract:[
                                            {$multiply:["$averageLoadTime",10]},
                                            {$mod:[{$multiply:["$averageLoadTime",10]}, 1]}
                                        ]},
                                        10
                                    ]
                                },
                                count:"$count"

                            }
                        },
                        {
                            $sort : { count : -1 }
                        }
                    ]).toArray(function (err, assetTypes) {
                        if(err!=null){

                            console.log(err);
                            res.render("error.html");
                            return;
                        }
                        /* Top level stats*/
                        benchmarkDB.aggregate([
                            {
                                $match: {
                                    "originUrl": site,
                                    "fileSize": {"$exists": true, "$ne": null}
                                }
                            },
                            {
                                $group: {
                                    _id: "$adNetwork",
                                    count: {$sum: 1},
                                    averageFileSize: {$avg: "$fileSize"},
                                    averageLoadTime: {$avg: "$assetCompleteTime"}
                                }
                            },
                            {
                                $project: {
                                    averageFileSize: {
                                        $divide: [
                                            {
                                                $subtract: [
                                                    {$multiply: ["$averageFileSize", 10]},
                                                    {$mod: [{$multiply: ["$averageFileSize", 10]}, 1]}
                                                ]
                                            },
                                            10
                                        ]
                                    },
                                    averageLoadTime: {
                                        $divide: [
                                            {
                                                $subtract: [
                                                    {$multiply: ["$averageLoadTime", 10]},
                                                    {$mod: [{$multiply: ["$averageLoadTime", 10]}, 1]}
                                                ]
                                            },
                                            10
                                        ]
                                    },
                                    count: "$count"

                                }
                            },
                            {
                                $sort : {count : -1}
                            },
                            {
                                $limit : 5
                            }
                        ]).toArray(function (err, networkWiseStats) {
                            if(err!=null){

                                console.log(err);
                                res.render("error.html");
                                return;
                            }
                            benchmarkDB.aggregate([
                                {
                                    $match: {
                                        "fileSize" : { "$exists" : true, "$ne": null}
                                    }
                                },
                                {
                                    $group: {
                                        _id: "$originUrl",
                                        count: {$sum: 1},
                                        averageFileSize: {$avg : "$fileSize"},
                                        averageLoadTime: {$avg: "$assetCompleteTime"}
                                    }
                                },
                                {
                                    $project:
                                    {
                                        _id: "$_id",
                                        averageFileSize:
                                        {
                                            $divide:[
                                                {$subtract:[
                                                    {$multiply:["$averageFileSize",10]},
                                                    {$mod:[{$multiply:["$averageFileSize",10]}, 1]}
                                                ]},
                                                10
                                            ]
                                        },
                                        averageLoadTime:{
                                            $divide:[
                                                {$subtract:[
                                                    {$multiply:["$averageLoadTime",10]},
                                                    {$mod:[{$multiply:["$averageLoadTime",10]}, 1]}
                                                ]},
                                                10
                                            ]
                                        },
                                        count:"$count"

                                    }
                                },
                                {
                                    $match : {
                                        "_id" : site
                                    }
                                }

                            ]).toArray(function (err, overall){
                                if(err!=null){

                                    console.log(err);
                                    res.render("error.html");
                                    return;
                                }
                                res.render('sitestats.html', {
                                    overall : overall, //Top level stats for site
                                    networkWiseStats: networkWiseStats, // Network level stats
                                    site: site, // site name
                                    assetTypes: assetTypes, // asset type level stats
                                    records: recordsForSite // Histogram stats
                                });
                                db.close();
                            });
                        });
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


/* GET privacy policy page. */
router.get('/privacy', function(req, res) {
  res.render('privacy.html');
});
router.get('/search', function(req, res){
    var searchBy = "adNetwork";

    if (req.get('referer') != null){
        var referer = req.get('referer');
        if (referer.includes("networks")){
            searchBy = 'adNetwork';
        } else if (referer.includes('sites')){
            searchBy = 'originUrl';
        }
        if (referer.includes("search")) {
            console.log("Taking from param");
            searchBy = req.query.searchBy;
        }
    }

    try {
        MongoClient.connect(url, function(err, db) {
            if(err!=null){

                console.log(err);
                res.render("error.html");
                return;
            }
            var benchmarkDB = db.collection('benchmark_logs');
            try {
                benchmarkDB.aggregate([
                    {
                        $group: {
                            _id : "$" + searchBy,
                            count: { $sum : 1}
                        }
                    },
                    {
                        $match: {
                            "_id" : { $regex: req.query.query, $options: 'i' }
                        }
                    }
                ]).toArray(function(err,searchResults){
                    if(err!=null){

                        console.log(err);
                        res.render("error.html");
                        return;
                    }
                    res.render("search.html", {
                        searchResults :searchResults,
                        category: searchBy,
                        searchTerm: req.query.query
                    })
                });
            } catch (e) {

                console.log("Could not connect to MongoDb " + e);
            }
        });
    } catch (e) {
        console.log("Could not connect to MongoDb " + e) ;
    }

});

router.get('/contact', function(req, res) {
  res.render('contact.html');
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
                        res.send("Data successfully recieved by Site-Sonar. Thanks :-).");
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

function formatBytes (bytes, decimals) {
    if (bytes === 0) {
        return '0 Bytes';
    }

    var k = 1024;
    var dm = decimals + 1 || 3;
    var sizes = ['bytes', 'kb', 'mb', 'gb', 'tb', 'pm', 'eb', 'zb', 'yb'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatMillseconds (millisec, decimals) {
    var seconds = (millisec / 1000).toFixed(decimals);
    var minutes = (millisec / (1000 * 60)).toFixed(decimals);
    var hours = (millisec / (1000 * 60 * 60)).toFixed(decimals);
    var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(decimals);

    if (seconds < 60) {
        return seconds + " sec";
    } else if (minutes < 60) {
        return minutes + " min";
    } else if (hours < 24) {
        return hours + " hrs";
    } else {
        return days + " days"
    }
}
