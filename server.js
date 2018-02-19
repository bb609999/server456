var express = require('express');
var session = require('cookie-session');
var app = express();
app.set('view engine', 'ejs');
var fileUpload = require('express-fileupload');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectID = require('mongodb').ObjectID;
var fs = require('fs');
var bodyParser = require('body-parser');
var https = require('https');

var async = require('async');


var url = "mongodb://bb609999:pkpk1234@ds139884.mlab.com:39884/bb609999";

// Middleware that serves static files in the public folder
// GET /index.html
app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));


app.listen(process.env.PORT || 8099);


app.get('/api', function(req, res) {
    console.log("/api");

    var OUHK = "22.316279,%20114.180408";
    var APM = "22.312441,%20114.225046";
    var PLAZA = "22.310602,%20114.187868";
    var GYIN = "22.308235,%20114.185765";
    var MEGA = "22.320165,%20114.208168";

    var POIS = [OUHK,APM,PLAZA,GYIN,MEGA];


    /*async.waterfall([
        function(next){
            next(POIS.length);
        },
        function(rst1,next){
            createPermute(rst1,function(err1, result1){
                next(err1, result1);
                console.log("finished");
                // 用 next 把參數傳到下一個 function
                // 把 result1 放到下面的 rst1
            });
        }
    ], function(err, rst){
        if(err) throw err;  // 匯集 err1 err2 err3
        console.log(rst+"finishedd");   // 收到的 rst = 上面的 result4
    });*/

    async.waterfall([
        function(callback) {
            var number = createPermute(POIS.length);
            callback(null, number);
        },
        function(arg1, callback) {
            // arg1 现在是 'one'， arg2 现在是 'two' 
            console.log(arg1);
            var permutation = permute(arg1);
            callback(null, permutation);
        },
        function(arg1, callback) {
            // arg1 现在是 'three' 
            var list = accessDistanceApi();
            console.log(arg1);
            callback(null, list);
        }
    ], function (err, result) {
        console.log(result);
        //执行的任务中方法回调err参数时，将被传递至本方法的err参数
        // 参数result为最后一个方法的回调结果'done'     
    });
    



});

app.get('/insert', function(req,res) {
  console.log("/insert");
  
MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("connected to db");
    insertDocument(db, function() {
        console.log('insert done!');
        db.close();
    });
});

});


function insertDocument(db, callback) {
    db.collection('schedules').insertOne( {
        "name" : "Introduction to Node.js",
        "author" : "John Dole",
        "price" : 75.00,
        "stock" : 0
    }, function(err, result) {
        assert.equal(err, null);
        console.log("Inserted a document into the books collection.");
        callback(result);
    });
};

function permute(str) {

    var ret = [];
  
    // permutation for one or two characters string is easy:
    // 'a'  -> ['a']
    // 'ab' -> ['ab', 'ba']
    if (str.length == 1) return [str];
    if (str.length == 2) return [str, str[1]+str[0]];
  
    // otherwise combine each character with a permutation
    // of a subset of the string. e.g. 'abc':
    //
    // 'a' + permutation of 'bc'
    // 'b' + permutation of 'ac'
    // 'c' + permutation of 'ab'
    str.split('').forEach(function (chr, idx, arr) {
      var sub = [].concat(arr); // "clone" arr
      sub.splice(idx, 1);
      permute(sub.join('')).forEach(function (perm) {
        ret.push(chr+perm);
      });
    });
  
    return ret;
  };

  function createPermute(POIS_number,callback){
    var str = "";
    for(var i =0 ; i<POIS_number;i++){
        str += i.toString();
        console.log("str = "+str);
    }
    return str;
    
  };

  function accessDistanceApi(){

    var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?'+
    'origins=22.316279,%20114.180408%7C22.312441,%20114.225046%7C22.310602,%20114.187868%7C22.308235,%20114.185765%7C22.320165,%20114.208168'+
    '&destinations=22.316279,%20114.180408%7C22.312441,%20114.225046%7C22.310602,%20114.187868%7C22.308235,%20114.185765%7C22.320165,%20114.208168'+
    '&mode=transit&key=AIzaSyC-uFuq2rGcGB34hLLeHtZBPF92B5UtCOI';

    https.get(url, function(res){
        var body = '';
    
        res.on('data', function(chunk){
            console.log("Doing");
            body += chunk;
        });
    
        res.on('end', function(){
            var fbResponse = JSON.parse(body);
            console.log("Got a response: ", JSON.stringify(fbResponse));
        });
    }).on('error', function(e){
          console.log("Got an error: ", e);
    });

  };