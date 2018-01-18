var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost"

module.exports = {
    connected : function(callback){
      MongoClient.connect(url, function(err, client) {
         var result = {"status":"down","colExists":false}
          if (err)
              callback(err,result);
          else{
              var db = client.db('BDD');
              result["status"]="up";
              db.listCollections().toArray(function(err, collections) {
                  for(var i=0;i<collections.length;i++){
                    if(collections[i].name =="instagramers") {result["colExists"]=true; break;}
                  }
                  callback(null,result);
              });
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
    },
    mapreduce: function(map,reduce,callback){
      MongoClient.connect(url, function(err, client) {
        if (err) {
            console.error(err);
        }
        var db = client.db('BDD');
        var collection = db.collection('instagramers');
        map = eval('(' + map + ')');
        reduce = eval('(' + reduce + ')');
        collection.mapReduce(map,reduce,{out: {inline:1}},function(err, docs) {
          callback(null,docs);
          client.close();
        });
      });
    }
}
