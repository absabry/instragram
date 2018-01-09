var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/instagram"

module.exports = {
    connected : function(callback){
      MongoClient.connect(url, function(err, status) {
          if (err) {
              callback(err,"down");
          }
          else{
              callback(null,"up");
          }
      });
    },
    find: function(request,sortInfos,callback){
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.error(err);
            }
            var collection = db.collection('instagramers');
            request= JSON.parse(request);
            if(sortInfos == null){
              collection.find(request.query,request.project).toArray(function(err, docs) {
                  callback(null,docs);
              });
            }
            else{
              sortInfos = JSON.parse(sortInfos)
              collection.find(request.query,request.project).sort(sortInfos["sortInfos"]).limit(sortInfos["limit"]).toArray(function(err, docs) {
                  callback(null,docs);
              });
            }
        });
    },
    aggregate : function(request,callback){
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.error(err);
            }
            var collection = db.collection('instagramers');
            collection.aggregate(request, function(err, docs) {
                callback(null,docs);
            });
        });
    },
    distinct : function(request,callback){
      MongoClient.connect(url, function(err, db) {
        if (err) {
            console.error(err);
        }
        var collection = db.collection('instagramers');
        collection.distinct("nationality", function(err, list) {
            callback(null,list);
        });
      });
    },
    getIndexs : function(callback){
      MongoClient.connect(url, function(err, db) {
        if (err) {
            console.error(err);
        }
        var collection = db.collection('instagramers');
        collection.indexInformation(function(err, docs) {
            callback(null,docs);
        });
      });
    }
}
