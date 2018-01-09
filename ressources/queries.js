use instagram; 


//-----------------------------------------------------------------------------------------FILTER FORM------------------------------------------------------------------------------------------//
db.instagramers.find({
"Country":"France",
"nbPays":1,
"infos.nbTotalImages":2,
"infos.nbImages":2,
"historique.name":"Pont Neuf",
"photos.dateCreation":"2014-06-21 20:14:53",
"photos.google.vicinity":"Carrousel du Louvre, 99 Rue de Rivoli, Paris",
"photos.name":"Pont Neuf",
"photos.longitude":2.341182232,
"photos.latitude":48.857006997,
"photos.google.rating":{$gte:3.9},
"photos.google.type":"food"
})

// regex working with array too
db.instagramers.find({
"photos.google.type":"food"
})
// just fooling around to discover
db.instagramers.find({
"$and":[{"photos.google.type":{"$regex":"point_of_interest","$options":"i"}},{"photos.google.type":{"$regex":"Food","$options":"i"}}]
},{"_id":0,"nbPays":1,"infos.nbTotalImages":1,"infos.nbImages":1})

db.instagramers.find({
"nbPays":2,
"infos.nbTotalImages":10
})

db.instagramers.find({"nbPays":2,"infos.nbTotalImages":10},{"_id":0,"idUser":1,"photos.name":1,"photos.idLocation":1})





//-----------------------------------------------------------------------------------------QUERIES------------------------------------------------------------------------------------------//
// first query 
db.instagramers.distinct("nationality")
db.instagramers.aggregate([
                     { $group: { "_id": "$nationality", "nb":{$sum:1}}},
                     { $project: {_id:0,nationality: "$_id",count:"$nb"}},
                     { $sort: { "count": -1}}
                   ])  


// second query
db.instagramers.find({ "photos.name":"Tour Eiffel"})
tourEiffel = [2.294576168, 48.858362295]
db.instagramers.find({"photos.coords":{$near:{$geometry:{"type":"Point","coordinates":tourEiffel},$maxDistance:200}}}) ;




//-----------------------------------------------------------------------------------------ADMIN QUERIES------------------------------------------------------------------------------------------//

db.instagramers.distinct('nationality')

db.instagramers.getShardDistribution()
db.adminCommand( { listShards : 1 } )
db.printShardingStatus()
db.instagramers.getIndexes()

db.instagramers.find({ "historique" : { $size: 0 }}).count() // having no historique
db.instagramers.aggregate([
	{ "$group": {"_id": null, "avg_hist": { "$avg": {"$size": "$historique"} }}},
	 { "$project": {"_id":0,"avg_per_user": "$avg_hist"}}
]) // mean historique
db.instagramers.find({},{"nbTotalImages":1, "_id":0}).sort({"nbTotalImages":-1}).limit(1) // max historique per person

db.instagramers.find({ "photos" : { $size: 0 }}).count() // having no photos
db.instagramers.aggregate([
	{ "$group": {"_id": null, "avg_photos": { "$avg": {"$size": "$photos"} }}},
	 { "$project": {"_id":0,"avg_per_user": "$avg_photos"}}
]) // mean photos
db.instagramers.aggregate([
	{ "$group": {"_id": null, "count": { "$sum": "$nbImages" }}},
	 { "$project": {"_id":0,"all_photos_count": "$count"}}
]) // number of photos taken at June 2014 in Paris

db.instagramers.find({},{"nbImages":1, "_id":0}).sort({"nbImages":-1}).limit(1) // max image per person
db.instagramers.find({ "photos" : { $size: 0 }},{"nbImages":1}).sort({age:+1}).limit(1) // min not null image per person


db.instagramers.find({"idUser":647057})





