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

var APIKEY = "AIzaSyC-uFuq2rGcGB34hLLeHtZBPF92B5UtCOI"

// Middleware that serves static files in the public folder
// GET /index.html
app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));


app.listen(process.env.PORT || 8099);


app.get('/api', function(req, res) {
    console.log("/api");

  //  var OUHK = "22.316279,114.180408";
  //  var APM = "22.312441,114.225046";
   // var PLAZA = "22.310602,114.187868";
  //  var GYIN = "22.308235,114.185765";
  //  var MEGA = "22.320165,114.208168";

    //http://localhost:8099/api?
   // loc=22.316279,114.180408|
   // 22.312441,114.225046|22.310602,114.187868|
   // 22.308235,114.185765|22.320165,114.208168

    
    var reqPOIS = req.query.loc;
    console.log(reqPOIS);


    var POIS = reqPOIS.split("|");

    console.log(POIS);

   // var POIS = [OUHK,APM,PLAZA,GYIN,MEGA];


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
            var list = accessDistanceApi(res,arg1,POIS);
            console.log(arg1);
            callback(null, list);
        }
    ], function (err, result) {
        console.log(result);
        //执行的任务中方法回调err参数时，将被传递至本方法的err参数
        // 参数result为最后一个方法的回调结果'done'     
    });
    



});

app.get('/api/place/openinghour', function(req, res) {
    console.log("/api");

    var keyword = req.query.keyword;
    var lat = req.query.lat;
    var lng = req.query.lng;
    console.log(req);

    

  //  var keyword = "孫中山紀念館";
  //  var lat = 22.2819842;
 //   var lng = 114.150816;

    function myNew(next){
        console.log("Im the one who initates callback");
        next("nope", "success");
    }
    
    
    myNew(function(err, res){
        console.log("I got back from callback",err, res);
    });



    async.waterfall([
        function(callback) {
         //var place_id = accessOpenHourApi(keyword,lat,lng,res);

         //setTimeout(getOpeningHour(place_id),3000);

        accessOpenHourApi(keyword,lat,lng,res);


            callback(null, "place_id");
        },
        function(arg1, callback) {
            // arg1 现在是 'one'， arg2 现在是 'two' 
            console.log(arg1);
            callback(null, "two");
        },
        function(arg1, callback) {
            // arg1 现在是 'three' 
            console.log(arg1);
            callback(null, "three");
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

app.post('/insert', function(req,res) {
    console.log("/insert");
    console.log("req.body = "+req.body);
    
  MongoClient.connect(url,req.body, function(err, db) {
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
        console.log("Inserted a document into the schedule collection.");
        callback(result);
    });
};

//API Duration
///////////////////////////////////////////////////////
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

//// Get Duration List From Api
  function accessDistanceApi(response,pathlist,POIS){

    var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?'+
    'origins=';

    for(var i =0;i<POIS.length;i++){
        url += POIS[i]+"%7C";
    }

    url+= "&destinations=";

    for(var i =0;i<POIS.length;i++){
        url += POIS[i]+"%7C";
    }

    url += '&mode=transit&key='+APIKEY;

    
    var req = https.get(url, function(res){
        var body = '';
    
        res.on('data', function(chunk){
            console.log("Doing");
            body += chunk;
    
        });
        res.on('end', function(){

            
            var JSONResponse = JSON.parse(body);
            
            console.log("Got a response: ", JSON.stringify(JSONResponse));

            var durationValues = getDurationFromApi(JSONResponse);

            console.log("Got a response durationValues: ", durationValues);

            
            var shortestPath = calculateShortestPath(pathlist,durationValues,POIS);
            
            response.send(shortestPath);

            
       

        });
    }).on('error', function(e){ 
         console.log("Got an error: ", e);
    }).end();



  };



  function getDurationFromApi(JSONResponse){

    var durationValues = Create2DArray(JSONResponse['rows'].length);

    console.log("Got a response2: ", JSON.stringify(JSONResponse));
    //console.log("Duration " ,JSONResponse['rows'][0]['elements'][1]['duration']['value']);

    for (var i = 0; i < JSONResponse['rows'].length; i++){
        for (var j = 0; j < JSONResponse['rows'].length; j++){
            if(JSONResponse['rows'][i]['elements'][j]['duration']){
            durationValues[i][j] = JSONResponse['rows'][i]['elements'][j]['duration']['value'];
        }
        }
    }

    console.log(durationValues);

    return durationValues;

  }

  function Create2DArray(rows) {
    var arr = [];
  
    for (var i=0;i<rows;i++) {
       arr[i] = [];
    }
  
    return arr;
  }

function calculateShortestPath(pathList,durationlist,POIS){
    var Totalduration = 0;
    var shortestTemp = "";
    var shortest_path = 0;
    var finalmarkers = [POIS.length];

    for(var i =0 ; i<pathList.length;i++){
        for(var j =0 ; j<POIS.length;j++){
            if(j+1>=POIS.length){
                Totalduration += 0;
            }else {
                    Totalduration += durationlist[parseInt(pathList[i].substring(j, j + 1))][parseInt(pathList[i].substring(j + 1, j + 2))];

            }
        }
        if(shortest_path==0||shortest_path>Totalduration){

            shortest_path = Totalduration;
            shortestTemp = pathList[i];
            //Log.d("Shortest Path", pathList.get(i));
            //Log.d("Shortest duration",String.valueOf(Totalduration));
        }
        Totalduration = 0;

    }
   // Log.d("Shortest Path", ""+shortest_path);
  //  Log.d("Shortest Path", ""+shortestTemp);
  console.log("Shortest Duration", shortest_path);
  console.log("Shortest Path", ""+shortestTemp);

  for(var i =0;i<POIS.length;i++){
    var temp = parseInt(shortestTemp.substring(i,i+1));
    finalmarkers[i]=POIS[temp];
}
console.log("POIS", ""+finalmarkers);

var finalDurationIntList = [POIS.length];
for(var i =0 ; i<POIS.length-1;i++){

    //0 to 2 02341
finalDurationIntList[i] = durationlist[parseInt(shortestTemp.substring(i,i+1))] [parseInt(shortestTemp.substring(i+1,i+2))];
}

var finalresult = finalmarkers.toString()+"|"+shortest_path+"|"+finalDurationIntList.toString();

if(!shortest_path){
    return "No Result";
}

return finalresult;
  
}

////////////////////////////////////
//API Opening hour

function accessOpenHourApi(keyword,lat,lng,response){
    var address = "https://maps.googleapis.com/maps/api/place/radarsearch/json?keyword=";

    address += keyword;

    address+="&location=";
    address+=lat+","+lng;
    address+="&radius=10&key="+APIKEY;


    console.log(address);


  var address_encoded = encodeURI(address);




    var req = https.get(address_encoded, function(res){
        
        var body = '';
    
        res.on('data', function(chunk){
            console.log("Doing");
            body += chunk;
    
        });
        res.on('end', function(){

            console.log("Got a response: ",body);

            var JSONResponse = JSON.parse(body);
            
            console.log("Got a response: ", JSON.stringify(JSONResponse));

            if(JSONResponse['status']=="INVALID_REQUEST")
                {response.send("No Result");}else{

            var place_id = JSONResponse['results'][0]['place_id'];

            console.log("Got a response: ", place_id);

            getOpeningHour(place_id,response);
                }


        });
    }).on('error', function(e){ 
         console.log("Got an error: ", e);
    }).end();


}

function getOpeningHour(place_id,response){
    var address = "https://maps.googleapis.com/maps/api/place/details/json?placeid=";

    address += place_id;

    address+="&key="+APIKEY;


    console.log(address);



    var req = https.get(address, function(res){
        
        var body = '';
    
        res.on('data', function(chunk){
            console.log("Doing");
            body += chunk;
    
        });
        res.on('end', function(){

            console.log("Got a response: ",body);

            var JSONResponse = JSON.parse(body);
            
            console.log("Got a response: ", JSON.stringify(JSONResponse));

            if(JSONResponse['result']){
            var periods = JSONResponse['result']['opening_hours']['periods'];

            var openHourList = [7];

            for(var i=0;i<periods.length;i++){
                var open =  periods[i]['open']['time'];
                var close =  periods[i]['close']['time'];
                var day =  periods[i]['open']['day'];
                openHourList[day] = open +"-"+ close;
            }

            response.send(openHourList);


            }else{
             response.send("No Result");
                                }
            


        });
    }).on('error', function(e){ 
         console.log("Got an error: ", e);
    }).end();
}
