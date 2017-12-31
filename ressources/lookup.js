use insta; 
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