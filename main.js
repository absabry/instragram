// "C:\Program Files\MongoDB\Server\3.4\bin\mongoimport.exe"
//--db instagram --collection historiqueUsers --drop --file
// "C:\Users\HP\Desktop\ESILVS09\Application Cloud\Projet\BDD\Documents\historiqueUsers.json"
var express = require('express');
var bodyParser = require('body-parser');
var connexion= require('./js/connexion.js');
const exec = require('child_process').exec;
var fs = require('fs');
var request= require('request');
var path = require('path');
var result;


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
})

app.get('/analyst', (req, res) => {
    res.render(__dirname + '\\view\\analyst');
});
app.get('/users', (req, res) => {
    res.render(__dirname + '\\view\\users');
});

app.get('/', (req, res) => {
  connexion.connected(function(err,data){
      status=data;
      var description = "You can use this application to extract some informations from our instagram database.";
      if(err != null){
          description = "<i>"+err+"</i>";
      }
      res.render(__dirname + '\\view\\index', {status:status, description:description});
  })
});

app.post("/", function (req, res) {
    var status="down"
    var description="Connexion is lost.";
    if(!fs.existsSync("C:\\data") || !fs.existsSync("C:\\data\\db")){
        exec("mkdir C:\\data\\db");
    }
    if (fs.existsSync(req.body.path+'\\mongod.exe')) {
        var command="start "+ "\"\"  " + '\"'+req.body.path +'\\mongod.exe\"';
        exec(command);
        if(req.body.recreate =="on"){
            var pathJson = path.dirname(fs.realpathSync(__filename))+ '\\reuters.json';
            downloadAddDB(req,pathJson);
        }
        status="up"
        description="You can use this application to extract some informations from our instagram database.";
    }
    else{
        status="down"
        description="The database file named 'instagram.json' "+
                    "dosen't exists. Add it in the directory "+__dirname+" and try again. ";
    }
    res.render(__dirname + '\\view\\index',{status:status, description:description});
});

app.post("/auto", function (req, res) {
    result=JSON.parse(req.body.query)
    if(result.agg==1){
        connexion.aggregate(result,function(err,data){
            result=data;
            res.render(__dirname + '\\view\\result',{agg:1,result:result});
        })
    }
    else{
        connexion.find(JSON.stringify(result),function(err,data){
            result=data;
            res.render(__dirname + '\\view\\result',{agg:0,result:result});
        })
    }
});

app.post("/search", function (req, res) {

    var request={
        "query" :{},
        "project":{}
    }
    if(req.body.places !== undefined && req.body.places != ""){
        request.query["places"]= {"$regex" : req.body.places, "$options" : "i"};
    }
    if(req.body.title !== undefined && req.body.title != ""){
        request.query["text.title"]= {"$regex" : req.body.title, "$options" : "i"};
    }
    if(req.body.the_body !== undefined && req.body.the_body != ""){
        request.query["text.body"]= {"$regex" : req.body.the_body, "$options" : "i"};
    }
    if(req.body.companies !== undefined && req.body.companies != ""){
        request.query["compaines"]= {"$regex" : req.body.compaines, "$options" : "i"};
    }
    if(req.body.topics !== undefined && req.body.topics != ""){
        request.query["topics"]= {"$regex" : req.body.topics, "$options" : "i"};
    }
    connexion.find(JSON.stringify(request),function(err,data){
        result=data;
        res.render(__dirname + '\\view\\result',{agg:0,result:result});
    })
});


function downloadAddDB(req,pathJson){
    var options = {
        url:"http://raw.githubusercontent.com/absabry/mongodb/master/reuters.json" ,
    };
    request(options, function(err, response, body) {
        if(!err) {
            fs.writeFile('instagram.json', response.body)
        }
    });
    var command= '\"'+req.body.path +'\\mongoimport.exe\" --db test --collection reuters --drop --file '+ '\"'+pathJson+'\"';
    exec(command);
}


app.listen(8888);
console.log("Magic happens on the 8888 port!");
