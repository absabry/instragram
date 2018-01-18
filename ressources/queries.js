use BDD;


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




// Quelle est l'origine des utilisateurs les plus fréquent sur Paris au mois Juin 2014? (count et proportion)
var num = db.instagramers.count();
db.instagramers.aggregate(
    [
        { "$group": { "_id": "$nationality", "count":{"$sum":1}}},
        { "$project": {
            "_id":0,
            "nationality": "$_id",
            "count": 1,
            "percentage": {
                "$concat": [ { "$substr": [ { "$multiply": [ { "$divide": [ "$count", {"$literal": num }] }, 100 ] }, 0,7] }, "", "%" ]}
            }
        },
        { "$sort": { "count": -1}}
    ]
)

// Combien d'utilisateurs visitent la Tour Eiffel tous les jours ? Donnez une proportion sur les journées.
db.instagramers.aggregate(
	{ $geoNear: {near: { type: "Point", coordinates: [2.294576168, 48.858362295]},distanceField: "dist.calculated",maxDistance: 10,spherical: true}},
	{$unwind: "$photos"},
	{ $group: {_id: { $dayOfMonth: "$photos.dateCreation"}, "photography": { $sum: 1 } } },
  { "$sort": { "_id": 1}},
  { $project: {_id:0,"day":{"$concat": [ { "$substr": ["$_id",0,2] }, "-", "06" ]} , "nbPhotography": "$photography" }}
)

// Les utilisateurs ont déjà visité l'arc de triomphe ET place du troacdéro
db.instagramers.find({ "$and" : [ {"historique.name":{ "$regex" : "Arc de Triomphe","$options" : "i"}},
  								{"historique.name":{ "$regex" : "Place du Trocadéro","$options" : "i"}}
  							  ]},
  							  {"_id":0,"idUser":1,"historique":1})


 //Qui visite Le Louvre le plus souvent ? Regroupez les résultats par nationalité.
db.instagramers.find({"photos.name":{ "$regex" : "louvre","$options" : "i"}})
// louvre [2.335817814, 48.860959845]
db.instagramers.aggregate(
	{ "$geoNear": {"near": { "type": "Point", "coordinates":[2.335817814, 48.860959845]},"distanceField": "dist.calculated","maxDistance": 10,"spherical": true}},
	{ "$unwind": "$photos"},
	{ "$group": {"_id":"$nationality", "photography":{"$sum": 1}}},
	{ "$project": {"_id":0,"nationality":"$_id", "nbPhotography": "$photography" }},
	{ "$sort": { "nbPhotography": -1}}
	)



//Trouver les lieux de type "food" ou "cafe" ou "restaurant" ou "meal_delivery"  les mieux notés de Paris (d'après la notation Google). On considère la note à partir d'au moins 100 photos publiés durant le mois de Juin 2014.
db.instagramers.aggregate(
	{"$unwind": "$photos"},
	{"$match": { "$or":[ {"photos.type": { "$regex" : "food","$options" : "i"}},{"photos.type": { "$regex" : "restaurant","$options" : "i"}},{"photos.type": { "$regex" : "meal_delivery","$options" : "i"}},{"photos.type": { "$regex" : "cafe","$options" : "i"}}]}},
	{"$group": {"_id":"$photos.name", "moy_avg":{"$avg": "$photos.rating"}, "count":{"$sum":1}}},
	{"$match": {"count":{ "$gt": 100 }}},
	{ "$project": {"_id":0,"place":"$_id", "moy_rate": "$moy_avg", "count_photos": "$count" }},
	{ "$sort": { "moy_rate": -1}}
	)

// Donner le type de lieu où les anglais aiment le plus souvent poster sur Instagram.
db.instagramers.aggregate(
	{"$match":{"nationality":"United Kingdom"}},
	{"$unwind": "$photos"},
	{"$unwind": "$photos.type"},
	{"$group": {"_id":"$photos.type", "count":{"$sum":1}}},
	{ "$project": {"_id":0,"type":"$_id", "count": "$count" }},
	{ "$sort": { "count": -1}}
	)


//Calculer les moyennes de pays visités par nationalité
db.instagramers.aggregate(
	{"$group": {"_id":"$nationality", "moy_pays":{"$avg":"$nbPays"},"count":{"$sum":1}}},
	{ "$project": {"_id":0,"nationality":"$_id", "avg_cntry_visites": "$moy_pays","nbOfPeople": "$count" }},
	{ "$sort": { "avg_cntry_visites": -1}}
	)



// Calculer proportion d'utilisation d'instagram de chaque nationliaté.
db.instagramers.aggregate(
	{"$group": {"_id":"$nationality", "avg_use":{"$avg":"$nbTotalImages"},"count":{"$sum":1}}},
	{"$project": {"_id":0,"nationality":"$_id", "avg_use_per_user": "$avg_use","nbUsers":"$count"}},
	{"$sort": { "avg_use_per_user": -1}}
	)

// Le jour de la semaine preferé des Americains
db.instagramers.aggregate(
	{ "$match":{"nationality":"United States"}},
	{ "$unwind": "$photos"},
	{ "$group": {"_id": { "$dayOfWeek": "$photos.dateCreation"}, "photography": { "$sum": 1 } } },
  { "$sort": { "_id": 1}},
  { "$project" : {"_id":0,"nbPhotography": "$photography", "day": {"$cond" : [{"$eq" : [ 1,"$_id"]},"Dimanche",
          {"$cond" : [{"$eq" : [2,"$_id"]},"Lundi",
          {"$cond" : [{"$eq" : [3,"$_id"]},"Mardi",
          {"$cond" : [{"$eq" : [4,"$_id"]},"Mercredi",
          {"$cond" : [{"$eq" : [5,"$_id"]},"Jeudi",
          {"$cond" : [{ "$eq" : [ 6,"$_id"]},"Vendredi",
          "Samedi"]}]}]}]}]}]}
	}}
)


// L'heure préferé des instagramers
db.instagramers.aggregate(
	{"$unwind": "$photos"},
	{ "$group": {"_id": {"day":{ "$dayOfWeek": "$photos.dateCreation"},"hour":{"$hour": "$photos.dateCreation"}}, "photography": { "$sum": 1 } } },
	{ "$project" : {"_id":0,"nbPhotography": "$photography","hour":{"$concat": [ { "$substr": ["$_id.hour",0,2] }, "", "H" ]},
	   "day": {"$cond" : [{"$eq" : [ 1,"$_id.day"]},"Dimanche",
          {"$cond" : [{"$eq" : [2,"$_id.day"]},"Lundi",
          {"$cond" : [{"$eq" : [3,"$_id.day"]},"Mardi",
          {"$cond" : [{"$eq" : [4,"$_id.day"]},"Mercredi",
          {"$cond" : [{"$eq" : [5,"$_id.day"]},"Jeudi",
          {"$cond" : [{ "$eq" : [ 6,"$_id.day"]},"Vendredi",
          "Samedi"]}]}]}]}]}]}
	}},
	{ "$sort": { "nbPhotography": -1}}
)


//---------------------------------------------------------------------------------------------------//
// Ayant une zone de localisation, et ayant un type de cette zone (tous les deux définit par l'analyste) trouver les utilisateurs les plus fréquent dans cette zone.

db.instagramers.aggregate(
	{"$unwind": "$photos"},
	{"$match":{'photos.coords': { "$geoWithin": { "$polygon": [[2.294576168,48.858362295],[ 2.300607557, 48.872147404],[2.294994593,48.873825615],[2.294576168,48.858362295]] }}}},
	{ "$group": {"_id": "$nationality", "photography": { "$sum": 1 } } },
	{ "$project" : {"_id":0,"nbPhotography": "$photography","nationality":"$_id"}},
	{ "$sort": { "nbPhotography": -1}}
)



//Montrer l'évolution de la visite de l'Avenue des Champs Elysées durant le mois.

db.instagramers.aggregate(
	{ "$geoNear": {"near": { "type": "Point", "coordinates": [ 2.300607557, 48.872147404]},"distanceField": "dist.calculated","maxDistance": 10,"spherical": true}},
	{ "$unwind": "$photos"},
	{ "$group": {"_id": { "day":{"$dayOfMonth": "$photos.dateCreation"},"hour":{"$hour": "$photos.dateCreation"}}, "photography": { "$sum": 1 } } },
	{ "$sort": { "_id.day": 1,"_id.hour":1}},
	{ "$project": {"_id":0,"day":{"$concat": [ { "$substr": ["$_id.day",0,2] }, "/", "06" ]},"hour":{"$concat": [ { "$substr": ["$_id.hour",0,2] }, "", "H" ]}, "nbPhotography": "$photography" }}
)




// Analyser les utilisateurs, pour donner une préférence de type de lieu a chaque nationalité. (je donne un compte, et dans l'appli je vais faire un petit script pour regrouper)
db.instagramers.aggregate(
	{"$unwind": "$photos"},
	{"$unwind": "$photos.type"},
	{"$group": {"_id":{"nationality":"$nationality","type":"$photos.type"}, "count":{"$sum":1}}},
	{"$project": {"_id":0,"type":"$_id.type", "nationality":"$_id.nationality", "count": "$count" }},
	{"$sort": { "count": -1}}
	)

// same using mapreduce
mapFunction = function () {
  	for(var i=0;i<this.photos.length;i++){
  	 	for(var j=0;j<this.photos[i].type.length;j++){
  	 		emit({"type":this.photos[i].type[j],"nationality":this.nationality},1);
  	 	}
  	 }
};
reduceFunction = function (key, values) {
	return Array.sum(values);
};
queryParam = {"query":{}, "out":{"inline":true}};
db.instagramers.mapReduce(mapFunction, reduceFunction, queryParam)






// Donner tout les type de lieux visités par nationalité
mapFunction = function () {
  	for(var i=0;i<this.photos.length;i++){
  	 	emit(this.nationality,{"types":this.photos[i].type});
  	 }
};
reduceFunction = function (key, values) {
	var types=[];
   	for(var i=0;i<values.length;i++){
   	  	for(var j=0;j< values[i].types.length; j++){
   	  	  	var type = values[i].types[j];
   	  		if (!Array.contains(types,type)) {
    			types.push(type);
			}
   		}
   	}
   return {"types":types};
};
queryParam = {"query":{}, "out":{"inline":true}};
db.instagramers.mapReduce(mapFunction, reduceFunction, queryParam)


//Sortir les lieux distinct visités de la base actuelle
mapFunction = function(){
  	var names = [];
  	if(this.photos != null && this.photos.length !=0){
  		for(var i=0;i<this.photos.length;i++){
  		  	var name = this.photos[i].name;
  			if (!Array.contains(names,name)) {
    			names.push(name);
			}
  		}
  	}
  	emit(null, {"lieux":names});
}

reduceFunction = function(key,values){
   	var lieux=[];
   	for(var i=0;i<values.length;i++){
   	  	for(var j=0;j< values[i].lieux.length; j++){
   	  	  	var lieu = values[i].lieux[j];
   	  		if (!Array.contains(lieux,lieu)) {
    			lieux.push(lieu);
			}
   		}
   	}
   return {"lieux":lieux};
};
queryParam = {"query":{},"out":{"inline":true}};

db.instagramers.mapReduce(mapFunction,reduceFunction,queryParam);




// L'heure de la jourrnée preferé pour visiter les lieux entre Avenue des Champs Elysées, Arc de Triomphe et la Tour Eiffel

db.instagramers.find({"photos.name":{"$regex":"Champs","$options":"i"}},{"photos.coords":1, "photos.name":1})

// tour eiffel : [2.294576168,48.858362295]
// arc de triomphe :[2.294994593,48.873825615]
// Champs Elysees : [ 2.300607557, 48.872147404]
db.instagramers.find({'photos.coords': { $geoWithin: { $polygon: [[2.294576168,48.858362295],[ 2.300607557, 48.872147404],[2.294994593,48.873825615],[2.294576168,48.858362295]] }}})


db.instagramers.aggregate(
  {"$unwind": "$photos"},
  {"$match":{"photos.coords": { "$geoWithin": { "$polygon": [[2.294576168,48.858362295],[ 2.300607557, 48.872147404],[2.294994593,48.873825615],[2.294576168,48.858362295]] }}}},
  { "$group": {"_id": {"$hour": "$photos.dateCreation"}, "photography": { "$sum": 1 } } },
  { "$sort": { "_id": -1}},
  { "$project" : {"_id":0,"photography": "$photography","hour":{"$concat": [ { "$substr": ["$_id",0,2] }, "", "H" ]}}}
)



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
