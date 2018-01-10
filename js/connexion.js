var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost"

module.exports = {
    connected : function(callback){
      MongoClient.connect(url, function(err, client) {
          if (err)
              callback(err,"down");
          else{
            callback(null,"up");
         }
      });
    },
    find: function(request,sortInfos,callback){
        MongoClient.connect(url, function(err, client) {
            if (err) {
                console.error(err);
                callback(err,null);
            }
            var db = client.db('BDD');
            var collection = db.collection('instagramers');
            request= JSON.parse(request);
            if(sortInfos == null){
              collection.find(request.query).project(request.project).toArray(function(err, docs) {
                  callback(null,docs);
                  client.close();
              });
            }
            else{
              sortInfos = JSON.parse(sortInfos)
              collection.find(request.query).project(request.project).sort(sortInfos["sortInfos"]).limit(sortInfos["limit"]).toArray(function(err, docs) {
                  callback(null,docs);
                  client.close();
              });
            }
        });
    },
    aggregate : function(request,callback){
        MongoClient.connect(url, function(err, client) {
            if (err) {
                console.error(err);
            }
            var db = client.db('BDD');
            var collection = db.collection('instagramers');
            collection.aggregate(request).toArray(function(err, docs) {
                callback(null,docs);
                client.close();
            });
        });
    },
    distinct : function(field,callback){
      MongoClient.connect(url, function(err, client) {
        if (err) {
            console.error(err);
        }
        var db = client.db('BDD');
        var collection = db.collection('instagramers');
        collection.distinct(field, function(err, list) {
            callback(null,list);
            client.close();
        });
      });
    },
    getIndexs : function(callback){
      MongoClient.connect(url, function(err, client) {
        if (err) {
            console.error(err);
        }
        var db = client.db('BDD');
        var collection = db.collection('instagramers');
        collection.indexInformation(function(err, docs) {
            callback(null,docs);
            client.close();
        });
      });
    },
    createIndex : function(field,callback){
      MongoClient.connect(url, function(err, client) {
        if (err) {
            console.error(err);
        }
        var db = client.db('BDD');
        var collection = db.collection('instagramers');
        collection.createIndex(field, function(err, list) {
            callback(null,list);
            client.close();
        });
      });
    }
}
