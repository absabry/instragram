var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/test"
var collection = 'reuters'

module.exports = {
    find: function(request,callback){
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.error(err);
            }
            var collection = db.collection(collection);
            request= JSON.parse(request);
            collection.find(request.query,request.project).toArray(function(err, docs) {
                callback(null,docs);
            });
        });
    },
    aggregate : function(request,callback){
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.error(err);
            }
            var collection = db.collection(collection);
            var query=[];
            if(Object.keys(request.match).length !== 0){
                query.push(request.match);
            }
            if(Object.keys(request.project).length !== 0){
                query.push(request.project);
            }
            if(Object.keys(request.group).length !== 0){
                 query.push(request.group);
            }
            if(Object.keys(request.sort).length !== 0){
                    query.push(request.sort);
            }
            collection.aggregate(query, function(err, docs) {
                console.log(docs);
                callback(null,docs);
            });
        });
    },
    connected : function(callback){
      MongoClient.connect(url, function(err, status) {
          if (err) {
              //console.error(err);
              callback(err,"down");
          }
          else{
              callback(null,"up");
          }
      });
    }
}
