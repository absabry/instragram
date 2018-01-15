# instragram
A web interface to interact with a part of Instagram database, using mongodb server.

To use this application you need to install some packages :
- express
- ejs
- body-parser
- request
- path
- child_process
- fs
- mongodb
- adm-zip
- system-sleep

You can use this line on your commande line (from your main repository) to add all packages you need :+1: :
> _npm install express ejs body-parser request path child_process fs mongodb adm-zip system-sleep_

To use this application you should install mongodb server. You can download it from http://www.mongodb.org/downloads and you should install node js also https://nodejs.org/en/download/. Think to define it in environment variable for easiest manipulation!

## Steps to use it

Launch the main file main.js > _node main.js_  
You have an optionnal argument that we strongly recommend using : time (in milliseconds) taht we should wait after launching your mongod.exe executable.
If your exectuable is already launched, you can juste keep 0 milliseconds. Otherwise we recommand to keep it to 5000 milliseconds to be sure that the application dosen't crush.

#### By the way, you have to ask for the creation of the database! if you don’t check the box at least one time, the database will be empty and there won’t be any results!) ####
#### First step
Enter your repo where you downloaded the mongodb server, more precisely the "bin" folder
![alt tag](https://github.com/absabry/mongodb/blob/master/images/connexion.JPG)

And then you can see that the mongodb is currently running!
![alt tag](https://github.com/absabry/mongodb/blob/master/images/connection%20began.JPG)


#### Second step

You have a query form, where you can search for articles you want with your criteria.
![alt tag](https://github.com/absabry/mongodb/blob/master/images/queryform.JPG)

#### Third Step
You have a another options to query the database, you can search for articles you want with some pre-defined queries we made for you!
![alt tag](https://github.com/absabry/mongodb/blob/master/images/auto.JPG)
And you have several options, you just have to choose one of them.
![alt tag](https://github.com/absabry/mongodb/blob/master/images/options.png)


## Results
When you query the database using the query form or the pre-defined queries, you would see the results in another page, like you would see it in RoboMongo (in JSON form)
Here's an example of utilisation :
Your query form
![alt tag](https://github.com/absabry/mongodb/blob/master/images/pres-result.JPG)
The result you have for this query :
![alt tag](https://github.com/absabry/mongodb/blob/master/images/results.JPG)
If you want to get the complete json object, you can get it by clicking on the “GET JSON”
button.
![alt tag](https://github.com/absabry/mongodb/blob/master/images/json.JPG)
And finally if there are no results, you will have something like :
![alt tag](https://github.com/absabry/mongodb/blob/master/images/noresult.JPG)
