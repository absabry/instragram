setwd('C:\\Users\\HP\\Projet')
library(DBI)
dbname=""
host="127.0.0.1"
port=3305
password=""
user=""
dateHistorique = "2014-05-01"
dateDebut="2014-06-1"
dateFin="2014-06-30"
nbPhotosMin=1
con <- dbConnect(RMySQL::MySQL(),  dbname = dbname, user=user, password=password, host=host, port=port,encoding = "latin1")



SQL=paste("SELECT instagram.dateCreation as dateCreation,
          instagram.idLocation as idLocation,
          instagram.idUser as idUser,
          instagram_location.name as name,
          instagram_location.longitude as longitude,
          instagram_location.latitude as latitude
          FROM instagram JOIN instagram_location ON instagram.idLocation = instagram_location.id
          WHERE instagram.dateCreation BETWEEN STR_TO_DATE('",dateDebut,"','%Y-%m-%d') AND STR_TO_DATE('",dateFin,"','%Y-%m-%d')
          ",sep="")
data <- dbGetQuery(con, SQL)
print(paste('fin data with', nrow(data),'rows'))

SQL=paste("SELECT idUser, count(*) AS nbImages
          FROM instagram
          WHERE instagram.dateCreation BETWEEN STR_TO_DATE('",dateHistorique,"','%Y-%m-%d') AND STR_TO_DATE('",dateFin,"','%Y-%m-%d')
          Group by idUser
          HAVING nbImages>=",nbPhotosMin,";",sep="")
idUser <- dbGetQuery(con, SQL)
print(paste('fin idUser with', nrow(idUser),'rows'))

SQL=paste("SELECT idUser, count(*) AS nbImages
          FROM instagram
          WHERE instagram.dateCreation BETWEEN STR_TO_DATE('",dateDebut,"','%Y-%m-%d') AND STR_TO_DATE('",dateFin,"','%Y-%m-%d')
          Group by idUser
          HAVING nbImages>=",nbPhotosMin,";",sep="")
temp <- dbGetQuery(con, SQL)
print(paste('fin temp with', nrow(temp),'rows'))


idUser = merge(x=temp,y=idUser,by="idUser")
print(paste('fin merge idUser with', nrow(idUser),'rows'))
names(idUser)[names(idUser)=="nbImages.x"] <- "nbImages"
names(idUser)[names(idUser)=="nbImages.y"] <- "nbTotalImages"




SQL=paste("SELECT idUser,idLocation,instagram_location.name as name
          FROM instagram JOIN instagram_location ON instagram.idLocation = instagram_location.id
          WHERE instagram.dateCreation BETWEEN STR_TO_DATE('",dateHistorique,"','%Y-%m-%d') AND STR_TO_DATE('",dateFin,"','%Y-%m-%d')
          ;",sep="")
historiqueVisite <- dbGetQuery(con, SQL)
historiqueVisite = merge(x=idUser,y=historiqueVisite,by="idUser")# delete the one who arent present here
historiqueVisite$nbImages = NULL
historiqueVisite$nbTotalImages = NULL

SQL="SELECT idUser,Country,nbSejour,nbJours,nbTotal as nbPays FROM instagram_user_paris"
users <-dbGetQuery(con, SQL)
print(paste('fin users with', nrow(users),'rows'))
users = merge(x=idUser,y=users,by="idUser")# delete the one who arent present here
users$nbImages = NULL
users$nbTotalImages = NULL

write.table(data, file = "30days//instagram.csv",row.names=FALSE, na="", sep=",")
write.table(idUser, file = "30days//historiqueUsers.csv",row.names=FALSE, na="", sep=",")
write.table(users, file = "30days//users.csv",row.names=FALSE, na="", sep=",")
write.table(historiqueVisite, file = "30days//historiqueVisite.csv",row.names=FALSE, na="", sep=",")
