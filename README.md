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

Our application is divided in three view like we can see in the next image : 
-the first one is the admin view, where we can get statstics of the database and counting queries.
-the second view is the users view, it contains a form and some prepared query.
-the third view is for analysts that need heavy queries to be done on the database.


![alt tag](https://github.com/absabry/instragram/blob/master/images/menu.PNG)

## Steps to use it

Launch the main file main.js > _node main.js_  
You have an optionnal argument that we strongly recommend using : time (in milliseconds) taht we should wait after launching your mongod.exe executable.
If your exectuable is already launched, you can juste keep 0 milliseconds. Otherwise we recommand to keep it to 5000 milliseconds to be sure that the application dosen't crush. 
So for launching the app when the server is already launched :   _node main.js 0_.,
Otherwise : _node main.js 5000_ or whatever milliseconds you think you need to be sure that the connexion is done. 

#### By the way, you have to ask for the creation of the database! if you don’t check the box at least one time, the database will be empty and there won’t be any results!) ####

#### Admin view
Enter your repo where you downloaded the mongodb server, more precisely the "bin" folder
![alt tag](https://github.com/absabry/instragram/blob/master/images/connexion.PNG)

And then you can see that the mongodb is currently running!
![alt tag](https://github.com/absabry/instragram/blob/master/images/mongod.PNG)

If you check the box, the database will be donwload from https://github.com/absabry/instragram/blob/master/database.zip, will be unzipped and import it to your mongodb server. This may take longer time, but you can check updates in the command line when you do this. 

After being connected, you can check directly for the statistics of your database and your queries, here's an example of what you may see: ![alt tag](https://github.com/absabry/instragram/blob/master/images/afterconnected.PNG)


#### User view

You have a query form, where you can search for instagramers you want with your criteria. You also can query the database by using some pre-defined queries we made for you!
![alt tag](https://github.com/absabry/instragram/blob/master/images/results%20of%20users.PNG)

You have several options, you just have to choose one of them.
![alt tag](https://github.com/absabry/mongodb/blob/master/images/options.png)

#### Analyst view

It's exactly like the user's view, but without a basic form to filter the instagramers. We have 4 prepared queries, with there DataViz to the analyst. 
You have several options, you just have to choose one of them.
![alt tag](https://github.com/absabry/mongodb/blob/master/images/options.png)

## Results
When you query the database using the filter form or the pre-defined queries, in either users view or results view, you would see the results in the same page in a good looking table. 
Here's an example of utilisation :
The filter form
![alt tag](https://github.com/absabry/instragram/blob/master/images/pre-result.PNG)
The result you have for this query :
![alt tag](https://github.com/absabry/instragram/blob/master/images/results%20of%20users.PNG)
If you want to get the complete json object, you can get it by clicking on the “GET JSON”
button (in the bottom ot the previous page).
![alt tag](https://github.com/absabry/instragram/blob/master/images/json.PNG)
And finally if there are no results, you will have something like :
![alt tag](https://github.com/absabry/instragram/blob/master/images/no%20result.PNG)


Another option we add it in our project, is to visuliaze the data in it's simplest way : a chart. This can be done with the pre-defined query onyl though. Here's an example of a chart ![alt tag](https://github.com/absabry/instragram/blob/master/images/plot.PNG)
