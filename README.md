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

#### First step
Enter your repo where you downloaded the mongodb server, more precisely the "bin" folder
![alt tag](https://github.com/absabry/instragram/blob/master/images/connexion.PNG)

And then you can see that the mongodb is currently running!
![alt tag](https://github.com/absabry/instragram/blob/master/images/mongod.PNG)

You have three options in this step : 

##### First one : 
If it's the first time to use this application, you need to download the database and import it to mongodb. We do it for you! 
All you have to do is following those steps : 
Launch the mongodb with a consequent waiting time (5 seconds in my case)
![alt tag](https://github.com/absabry/instragram/blob/master/images/1_node.PNG)

Then, you have to check the box, and enter the path to your bin folder
![alt tag](https://github.com/absabry/instragram/blob/master/images/1_path.PNG)

PS : if you forgot to check the box, the database wont be downloaded and imported : 
![alt tag](https://github.com/absabry/instragram/blob/master/images/1_wrong.PNG)

Then, you can see that mongodb is launched, but you have to wait for the downloaded database and the import phase.
![alt tag](https://github.com/absabry/instragram/blob/master/images/1_cmdafter.PNG)

Finally, you will have a message on the command line teeling you that all process are good 
![alt tag](https://github.com/absabry/instragram/blob/master/images/1_finally.PNG)

#### By the way, you have to ask for the creation of the database! if you don’t check the box at least one time, the database will be empty and there won’t be any results!) ####


##### Second one:
You  already had the database in the mongodb server, you just need a simple connexion to it : 
![alt tag](https://github.com/absabry/instragram/blob/master/images/2.PNG)

To do this, you shouldn't check the box 
![alt tag](https://github.com/absabry/instragram/blob/master/images/2_path.PNG)


##### Third one: 
Finally, it the database is already exoprted, and the mongod.exe is already running, you may run the application 
in this way : 
![alt tag](https://github.com/absabry/instragram/blob/master/images/3.PNG)
#### Second step

After you're connected, you will have three differents views: 

![alt tag](https://github.com/absabry/instragram/blob/master/images/menu.PNG)

##### Admin view 
You will have some statistics on the database 
![alt tag](https://github.com/absabry/instragram/blob/master/images/afterconnected.PNG)

##### Users view 
You will have two different ways to query the database. The first one is to filter users directly using a simple 
form, and in the second you would use the prepared query we ready to be exectued.
![alt tag](https://github.com/absabry/instragram/blob/master/images/users%20query.PNG)

The results will be in a responsive table form. It implement a quick search on it's elements : 
![alt tag](https://github.com/absabry/instragram/blob/master/images/results%20of%20users.PNG)

The results can be shown in a chart after this table for some queries 
![alt tag](https://github.com/absabry/instragram/blob/master/images/plot.PNG)

If there are no results, that table will be empty 
![alt tag](https://github.com/absabry/instragram/blob/master/images/no%20result.PNG)
You also have a button in the bottom of the page to get the json object we got from the query you asked for. 
![alt tag](https://github.com/absabry/instragram/blob/master/images/get%20json.PNG)

The json will be like : 
![alt tag](https://github.com/absabry/instragram/blob/master/images/json.PNG)


##### Analyst view 
The analyst view is exatcly like the users view, but the query are more heavy and may not be exectued any time. 


