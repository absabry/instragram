// npm install express body-parser child_process fs request adm-zip path system-sleep mongodb ejs
var express = require('express');
var bodyParser = require('body-parser');
var connexion= require('./js/connexion.js');
const exec = require('child_process').exec;
var fs = require('fs');
var request= require('request');
var AdmZip = require('adm-zip');
var path = require('path');
var sleep = require('system-sleep');

var result = []; var status = "down"; var description ="Connexion is lost.";
var sleepySeconds = process.argv.slice(2)!=''?process.argv.slice(2):5000; // 5000 milliseconds by default
var nbUserQuery = {"filter":0,"defined":0}; nbAnalystQuery=0; var stats = {"nbUserQuery":nbUserQuery,"nbAnalystQuery":nbAnalystQuery};


var app = express();
app.use("/css",  express.static(__dirname + '\\css'));
app.use("/js",  express.static(__dirname + '\\js'));
app.use("/vendor",  express.static(__dirname + '\\vendor'));
app.use("/images",  express.static(__dirname + '\\images'));
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.post('/json',function (req,res){ // json results only (without any css)
    res.write(JSON.stringify(result,null,4));
    res.end();
})

app.get('/analyst', (req, res) => {
    res.render(__dirname + '\\view\\analyst');
});

app.get('/users', (req, res) => {
    res.render(__dirname + '\\view\\users',{queried:0,result:[],plot:{},photos:false,error:null});
});

app.get('/', (req, res) => {
  connexion.connected(function(err,data){
      status=data;
      description = "You can use this application to extract some informations from our instagram database.";
      if(err != null){
          description = "<i>"+err+"</i>";
      }
      res.render(__dirname + '\\view\\index', {get:1,status:status, description:description,stats:stats});
  })
});

app.post("/", function (req, res) {
    if(req.body.beforeTreatement != undefined){
      console.log("in the first post (actually it's the get)");
      if(status == "down" || Object.keys(stats).length !=2){
        stats["nbUserQuery"] = nbUserQuery;
        stats["nbAnalystQuery"]= nbAnalystQuery;
        res.render(__dirname + '\\view\\index', {get:0,status:status, description:description,stats:stats});
      }
      else{
        console.log("time to sleep a little bit");sleep(sleepySeconds);console.log("we're on again"); // have to sleep to wait for the connexion
        checkCoordIndex();
        ComputeStats(res,status,description);
      }
    }
    else{
      console.log("in the second post (actually it's the post)");
      var recreate = false;
      if(!fs.existsSync("C:\\data") || !fs.existsSync("C:\\data\\db")){
          exec("mkdir C:\\data\\db");
      }
      if (fs.existsSync(req.body.path+'\\mongod.exe')) {
          status="up"
          var command="start "+ "\"\"  " + '\"'+req.body.path +'\\mongod.exe\"';
          exec(command);
          if(req.body.recreate =="on"){
            var pathJson = path.dirname(fs.realpathSync(__filename));
            downloadAddDB(req,pathJson);
            description = "File will be downloded,unzipped and imported to mongodb server in a few moments, check the console for more informations."+
            "You can use this application to extract some informations from our instagram database."
          }
          else{
            description="You can use this application to extract some informations from our instagram database.";
            console.log("time to sleep a little bit");sleep(sleepySeconds);console.log("we're on again"); // have to sleep to wait for the connexion
            checkCoordIndex();
            ComputeStats(res,status,description);
          }
      }
      else{
          status="down"
          description="The mongod.exe file doesn't exist in "+req.body.path+". Please change the location of your moongodb bin repository.";
          res.render(__dirname + '\\view\\index',{get:0,status:status, description:description,stats:[]});
      }
    }
});

app.post("/users", function (req, res) {
    if(req.body.query !== undefined && req.body.query!="") predefinedQuery(req,res);
    else filterQuery(req,res);
});

// import database
function downloadAddDB(req,pathJson){
  console.log("You asked to download the data, you have to wait a little bit");
  downloadAndUnzip('https://github.com/absabry/instragram/raw/master/database.zip', pathJson)
      .then(function (data) {
          var command= '\"'+req.body.path +'\\mongoimport.exe\" --db// instagram --collection instagramers --drop --file '+ '\"'+pathJson+'\\instagramers.json'+'\"';
          console.log("File has now been downloaded");
          exec(command);
          console.log("The file has been imported to mongodb database.");
          checkCoordIndex();
          ComputeStats(res,status,description);
      })
      .catch(function (err) {
          console.error(err);
    });
}

// download and unzip the database
var downloadAndUnzip = function (url, fileName) {

    /**
     * Download a file
     *
     * @param url
     */
    var download = function (url) {
        return new Promise(function (resolve, reject) {
            request({
                url: url,
                method: 'GET',
                encoding: null
            }, function (err, response, body) {
                if (err) {
                    return reject(err);
                }
                resolve(body);
            });
        });
    };

    /**
     * Unzip a Buffer
     *
     * @param buffer
     * @returns {Promise}
     */
    var unzip = function (buffer) {
        return new Promise(function (resolve, reject) {
            var zip = new AdmZip(buffer);
            zip.extractEntryTo("database/instagramers.json",fileName,false,true);
            resolve("good");
        });
    };
    return download(url)
        .then(unzip);
};

// tostring historique field
function formatHistorique(histObject){
  var historique ='Places already visited : ';
  for(var k=0; k < histObject.length; k++) historique += histObject[k]["name"]+ ", " ;
  return historique.substring(0, historique.length - 2)+ "."; // delete last comma
}

// tostring photos object
function formatPhoto(photosObject,selectedKeys){
      var row = '';
      if(photosObject.hasOwnProperty('name')){
          row += photosObject['name']+" ";
      }
      if(photosObject.hasOwnProperty('dateCreation')){
          row +="created at " + photosObject['dateCreation']+", ";
      }
      if(photosObject.hasOwnProperty('coords')){
        row +="located at " + JSON.stringify(photosObject['coords']['coordinates'])+" ";
      }
      if(photosObject.hasOwnProperty('address')){
        row +=", " + photosObject['address']+ ". ";
      }
      if(photosObject.hasOwnProperty('type')){
        row +="<br>This place have interest in " + photosObject['type'].join(", ");
      }
      if(photosObject.hasOwnProperty('rating')){
        row +=" and is rated " + photosObject['rating'] + " by Google users.";
      }
      return row;
}

function contains(array, element) {
    var i = array.length;
    while (i--) {
       if (array[i] === element) {
           return true;
       }
    }
    return false;
}

// dropdown queries
function predefinedQuery(req,res){
    nbUserQuery["defined"] +=1;
    var query = JSON.parse(req.body.query)

    if(query.agg==1){
      if(query.hasOwnProperty("countdoc")){
          connexion.find("{}",null,function(err,data){
              var count  = data.length;
              var queryText = JSON.stringify(query["query"])
              queryText = queryText.replace(new RegExp("\"countdoc\"", 'g'), count);
              connexion.aggregate(JSON.parse(queryText),function(err,data){
                  result=data;
                  var plot = createPlot(query);
                  res.render(__dirname + '\\view\\users',{queried:1,result:result,plot:plot,photos:false,error:null});
              })
        })
      }
      else{
          connexion.aggregate(query["query"],function(err,data){
              result=data;
              var plot = createPlot(query);
              res.render(__dirname + '\\view\\users',{queried:1,result:result,plot:plot,photos:false,error:null});
          })
      }
    }
    else{
        connexion.find(JSON.stringify(result),null,function(err,data){
            result=data;
            res.render(__dirname + '\\view\\result',{agg:0,result:result});
        })
    }
}

// create the array used to plot if needed to
function createPlot(query){
      var plot = {};
      if(query.hasOwnProperty('plot')){
        var plotInfos = query["plot"];
        plot["type"]= plotInfos.type;
        plot["label"]= plotInfos.label;
        plot["labels"]=[];
        plot["data"]= [];
        for(var i=0;i<result.length;i++){
          plot["labels"].push(result[i][plotInfos.labels])
          plot["data"].push(result[i][plotInfos.data])
        }
      }
      return plot;
}

// form queries
function filterQuery(req,res){
    nbUserQuery["filter"] +=1;
    request = prepareSearchFilters(req);
    if(Object.keys(request.query).length){
      connexion.find(JSON.stringify(request),null,function(err,data){
          keys=[]
          result=data;
          if(result.length!= 0) keys = Object.keys(result[0]);
          //if(result.length!=0)console.log("example result:\n"+JSON.stringify(result[0],null,4));
          newResult = flattenResponse(keys,result);
          //if(newResult.length!=0)console.log("example new result:\n"+JSON.stringify(newResult[0],null,4));
          res.render(__dirname + '\\view\\users',{queried:1,result:newResult,plot:{},photos:contains(keys,"photos") ,error:null});
      })
    }
    else{
      res.render(__dirname + '\\view\\users',{queried:1,result:[],plot:{},photos:false,error:"Please choose at least one filter from the form, or a query from the dropdown!"});
    }
}

// new result to be easier to handle in the ejs file
function flattenResponse(keys,result){
  var newResult = []; // create the a new json object to be easier to handle in the ejs file
  for(var i=0; i < result.length; i++) {
      var tuple = {};
      for(var j=0;j < keys.length;j++){
          if(keys[j]=="historique"){
             tuple[keys[j]] = formatHistorique(result[i][keys[j]]);
          }
          else if(keys[j] == "photos"){
            tuple["photos"] = [];
            var photosObject = result[i]["photos"];
            var selectedKeys = Object.keys(photosObject[0]);
            for(var k=0; k < photosObject.length; k++){
              tuple["photos"].push(formatPhoto(photosObject[k],selectedKeys));
            }
          }
          else{
            tuple[keys[j]] = result[i][keys[j]];
          }
      }
      newResult.push(tuple);
  }
  return newResult;
}

// get the selected field in the filter form in order to prepare the query
function prepareSearchFilters(req){
  var request={
      "query" :{},
      "project":{"_id":0,"idUser":1}
  }
  if(req.body.country !== undefined && req.body.country != ""){
      request.query["nationality"]= {"$regex" : req.body.country, "$options" : "i"};
      request.project["nationality"]=1;
  }
  if(req.body.nbCountry !== undefined && req.body.nbCountry != ""){
      request.query["nbPays"]= parseInt(req.body.nbCountry, 10);
      request.project["nbPays"]=1;
  }
  if(req.body.totImgs !== undefined && req.body.totImgs != ""){
      request.query["nbTotalImages"]= parseInt(req.body.totImgs,10);
      request.project["nbTotalImages"]=1;
  }
  if(req.body.junImgs !== undefined && req.body.junImgs != ""){
      request.query["nbImages"]=  parseInt(req.body.junImgs,10);
      request.project["nbImages"]=1;
  }
  if(req.body.visitedName !== undefined && req.body.visitedName != ""){
      request.query["historique.name"]= {"$regex" : req.body.visitedName, "$options" : "i"};
      request.project["historique.name"]=1;
  }
  if(req.body.address !== undefined && req.body.address != ""){
      request.query["photos.address"]= {"$regex" : req.body.address, "$options" : "i"};
      request.project["photos"]=1;
  }
  if(req.body.name !== undefined && req.body.name != ""){
      request.query["photos.name"]= {"$regex" : req.body.name, "$options" : "i"};
      request.project["photos"]=1;
  }
  if(req.body.date !== undefined && req.body.date != ""){
      request.query["photos.dateCreation"]= req.body.date;
      request.project["photos"]=1;
  }
  if(req.body.coord !== undefined && req.body.coord != ""){
      coords = req.body.coord.split(",");
      coord = [];
      if(coords.length==2){
        coord.push(parseFloat(coords[0]));
        coord.push(parseFloat(coords[1]));
      }
      request.query["photos.coords.coordinates"]=coord;
      request.project["photos"]=1;
  }
  if(req.body.radius !== undefined && req.body.radius != ""){
      if(request.query.hasOwnProperty("photos.coords.coordinates")){ // if not, skip this field
          request.query["photos.coords"]={"$near":{"$geometry":{"type":"Point","coordinates":request.query["photos.coords.coordinates"]},"$maxDistance":parseInt(req.body.radius,10)}};
      }
  }
  if(req.body.rating !== undefined && req.body.rating != ""){
      request.query["photos.rating"]= {"$gte":parseFloat(req.body.rating)}
      request.project["photos"]=1;
  }
  if(req.body.type !== undefined && req.body.type != ""){
      types = req.body.type.split(",");
      regexTypes = []
      for(var i=0;i<types.length;i++){
          regexTypes.push({"photos.type":{ "$regex" : types[i],"$options" : "i"}}) // to handle mistake writing ;)
      }
      request.query["$and"]= regexTypes;
      request.project["photos"]=1;
  }
  return request;
}

// admin statistics
function ComputeStats(res, status,description){
  connexion.distinct('nationality',function(err,list){
      var nationality=list;
      stats["Nationalities"] = "There are "+ nationality.length +" distinct nationality, including "+
      nationality[Math.floor(Math.random()*nationality.length)]+", "+
      nationality[Math.floor(Math.random()*nationality.length)]+" and "+
      nationality[Math.floor(Math.random()*nationality.length)]+".";
      connexion.getIndexs(function(err,docs){
          var keys = Object.keys(docs);
          var indexToString = 'We have '+ keys.length +' index on those datas.<br> ';
          for(var i =0;i<keys.length;i++){
              indexToString += "Index named "+ keys[i]+ " have value ["+ docs[keys[i]]+ "]. <br> ";
          }
          stats["Data's Indexes"] = indexToString.substring(0, indexToString.length - 1);
          var MeanPhotosPerUser = [
            { "$group": {"_id": null, "avg_photos": { "$avg": {"$size": "$photos"} }}},
            { "$project": {"_id":0,"avg_per_user": "$avg_photos"}}
          ]
          connexion.aggregate(MeanPhotosPerUser,function(err,data){
                //console.log(data);
               stats["Photos at June 2014"] = "User in Paris at June 2014 had averaged "+
               Number((data[0]["avg_per_user"]).toFixed(3)) + " photographies per user.";
              var sumOfPhotos = [
                { "$group": {"_id": null, "count": { "$sum": "$nbImages" }}},
                { "$project": {"_id":0,"all_photos_count": "$count"}}
              ]
              connexion.aggregate(sumOfPhotos,function(err,data){
                   stats["Photos at June 2014"] += "<br> They had taken " +
                   data[0]["all_photos_count"] + " photographies in total.";
                   var maxPhotos = {
                     "query" : {},
                     "project" : {"nbImages":1, "_id":0}
                   }
                   var sort = {
                     "limit":1,
                     "sortInfos" : {"nbImages":-1}
                   }
                   connexion.find(JSON.stringify(maxPhotos),JSON.stringify(sort),function(err,data){
                        stats["Photos at June 2014"] += "<br> The most activiest person had taken " +
                        data[0]["nbImages"] + " photographies in the whole month.";
                        connexion.find(JSON.stringify({"query" : {},"project" : {}}),null,function(err,data){
                             stats["Instagramers at June 2014"] = "There are " + data.length +
                             " users who had photographies in the whole month.";
                             var histMean = [
                                { "$group": {"_id": null, "avg_hist": { "$avg": {"$size": "$historique"} }}},
                                { "$project": {"_id":0,"avg_per_user": "$avg_hist"}}
                              ]
                             connexion.aggregate(histMean,function(err,data){
                                  stats["Instagramers at June 2014"] += "<br> They had averaged "
                                  + Number((data[0]["avg_per_user"]).toFixed(3)) +
                                  " photographies in the past 6 months.";
                                  var maxPhotos = {
                                    "query" : {},
                                    "project" : {"nbTotalImages":1, "_id":0}
                                  }
                                  var sort = {
                                    "limit":1,
                                    "sortInfos" : {"nbTotalImages":-1}
                                  }
                                  connexion.find(JSON.stringify(maxPhotos),JSON.stringify(sort),function(err,data){
                                    stats["Instagramers at June 2014"] += "<br> The most activiest person had taken "
                                    + data[0]["nbTotalImages"] +  " photographies in the past 6 months.";
                                     res.render(__dirname + '\\view\\index',{get:0,status:status, description:description,stats:stats});
                                  });

                             })
                        })
                   })
              })
          })
      })
  })
}

// create the 2Dphere index if needed
function checkCoordIndex(){
    connexion.getIndexs(function(err, docs) {
        var keys = Object.keys(docs);
        if(!contains(keys,"photos.coords_2dsphere")){
            connexion.createIndex({ "photos.coords" : "2dsphere" },function(err,docs){
                console.log("Index 'photos.coords' has just been created");
                console.log(docs);
            });
        }
    });
}


app.listen(8888);
console.log("Magic happens on the 8888 port!");
