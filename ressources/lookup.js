use instagram;

// clean locationGoogle database
db.locationGoogle.find().forEach(function(item)
{
    item.vicinity = item.vicinity.replace(new RegExp('/','g'), ',');
    var types = item.type.split("/");
    types = types.map(function(s) { return s.trim(); });
    item.type = types
    db.locationGoogle.save(item);
})

// first look up
db.datas.aggregate([
   {
     $lookup:
       {
         from: "locationGoogle",
         localField: "idLocation",
         foreignField: "idLocation",
         as: "google"
       }
    },
    {$unwind : {"path" : "$google"}},
    { $project: {"google._id":0,"google.idUser":0,"google.idLocation":0}},
    { $out : "datasGoogle" }
])

// look up series to create the final database
db.users.aggregate([
   {
     $lookup:
       {
         from: "historiqueVisite",
         localField: "idUser",
         foreignField: "idUser",
         as: "historique"
       }
    },
    { $project: {"historique._id":0,"historique.idUser":0}},
    {
     $lookup:
       {
         from: "historiqueUsers",
         localField: "idUser",
         foreignField: "idUser",
         as: "infos"
       }
    },
    {$unwind : {"path" : "$infos"}},
    { $project: {"infos._id":0,"infos.idUser":0}},
    {
     $lookup:
       {
         from: "datasGoogle",
         localField: "idUser",
         foreignField: "idUser",
         as: "photos"
       }
    },
    { $project: {"photos._id":0,"photos.idUser":0}},
    { $out : "instagramers" }
])

// handle coordinates format to be like :  { type: "Point", coordinates: [ -73.97, 40.77 ] },
// and delete all useless keys like 
db.instagramers.find().forEach(function(item)
{
    for(var i=0; i<item.photos.length; i++){
        var coords = {
          type: "Point",
          coordinates: [ item.photos[i].longitude, item.photos[i].latitude ]
        };
        
        // relocate interessant keys
        item.photos[i]["coords"] = coords; 
        item.photos[i]["rating"] = item.photos[i]["google"]["rating"]; 
        item.photos[i]["type"] = item.photos[i]["google"]["type"]; 
        item.photos[i]["address"] = item.photos[i]["google"]["vicinity"]; 
        
        // delete useless fields 
        delete item.photos[i]["latitude"];
        delete item.photos[i]["longitude"];
        delete item.photos[i]["google"];
    }
    db.instagramers.save(item);
})


// handle historique users and add it remove it to the master json
db.instagramers.updateMany( {}, { $rename: { "infos.nbImages": "nbImages" } } )
db.instagramers.updateMany( {}, { $rename: { "infos.nbTotalImages": "nbTotalImages" } } )
db.instagramers.update({}, {$unset: {infos:1}} , {multi: true});

// nationality instead of country...
db.instagramers.updateMany( {}, { $rename: { "Country": "nationality" } } )


// 2d sphere index
db.instagramers.ensureIndex( { "photos.coords" : "2dsphere" } );
/*
{ 
    "createdCollectionAutomatically" : false, 
    "numIndexesBefore" : 1.0, 
    "numIndexesAfter" : 2.0, 
    "ok" : 1.0
}
*/
