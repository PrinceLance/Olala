# Olala
just trying some stuffs in node js, this is an API server that help you to find driving directios.


# Disclaimer
I am super beginner on docker / promises so don't be that hard on me :) 
This project is to try some new stuffs by building API in nodejs (I come from PHP/Python background) 


# Prerequisite
Since I am a docker/node noob, I cant really tell you how to solve this or that error if you use stuffs that are different than mine.  
I am using CentOS7 (inside virtual machine)


# Installation
## Docker / Docker compose way
```
docker-compose up --build  
```

## Normal installation (guaranteed to run? maybe)
```
npm install
npm start
```
Note that I set database port to 27018, so you might want to either change my configs codes or set your db to listen to port 27018


# Use
To try if the installation is okay, go to: http://localhost:3000/ or http://0.0.0.0:3000/  
for documentation, go to http://0.0.0.0:3000/api-docs/

# Test
```
npm test
```

# Scale
Say... for some reason you want to make the app to be able to handle millions of user, here are the steps:
1. you have to set a mongo database server, preferably clustered/sharded one
2. If you want to use docker to deploy, rename docker-compose.yml to something else.
3. If you want to use docker to deploy, rename docker-compose-scale.yml to docker-compose.yml.
4. change the config file so the database url points to the database you set in step 1.
5. get as many server as you can, then deploy the code in them.
6. create a load balancer, simply use expressjs that have all the list of the servers in step 5, then spread the load to them. (first request go to server 1, second one go to server 2.. and so on).
7. the url of the "service" is the entry point of the load balancer.
8. in the not so long future, when you need to handle billions of user, simply add more server and do step 5, then add the server url to the load balancer list.
9. enjoy.

# Function
## Request shortest driving direction by submitting starting and end point (and waypoints in between)
Method: POST  
URL path: /api/v1/route  
 
Accept a set of waypoints in form of array of LatLong pairs from user input, that refer to the points you are driving through.  
Sample input: must have 2 or more points. In below case, this is request for directions from UBC business school to Surrey Central Station, via CD Richmond Center
```
[
	["49.264930", "-123.253188"],
	["49.166630", "-123.137884"],
	["49.189023", "-122.849819"]
]
```

sample output:  return an output for user to check the result. Since it takes time to do the directions.
```
{
  "token": "5b27934a39c545000f4b1f2a"
}
```

Example usage : 
```
curl -X POST "http://localhost:3000/api/v1/route" -H  "accept: application/json" -H  "Content-Type: application/json" -d "[\t[\"49.264930\", \"-123.253188\"],\t[\"49.166630\", \"-123.137884\"],\t[\"49.189023\", \"-122.849819\"]]"```
```

## Get shortest driving route  
Method: GET  
URL path: /api/v1/route/{token}  

Send the token received from POST /route. It can have 3 result, in progress, success, failure. If successful, it returns the waypoints (directions) driving distance in meters and driving duration in seconds.

sample input:  the token  
```
{
  "token": "5b27934a39c545000f4b1f2a"
}
```

Some Sample outputs
```
{  
  "status": "success",  
  "path": [  
    [  
      "49.2649112",  
      "-123.2542205"  
    ],  
	... // a lot of waypoints
    [  
      "49.1860713",  
      "-122.8519724"  
    ],  
    [  
      "49.1890226",  
      "-122.8498091"  
    ]  
  ],  
  "total_distance": 48870,  
  "total_time": 3763  
}
```

```
{
  "status": "failure",
  "error": "ZERO_RESULTS"
}
```

```
{
	"status": "in progress"
}
```

Example usage : 
```
curl -X GET "http://localhost:3000/api/v1/route/5b27934a39c545000f4b1f2a" -H  "accept: application/json"
```



# Next Version...Maybe
Load Balancer implementation. 

#  FAQ
1. What is "Olala"  
A. Obviously you are not French, are you? In the words of Abraham Lincoln:
> Pardon my French

2. Why the hassle, just dont use docker  
A. Then it won't be difficult enough for me.  

3. Since you come from PHP background, why not use it?  
A. So I can't try new stuffs because I am from PHP backgrounds?  

4. Why no code for the load balancer?  
A. In future release, and I guess you dont need to serve millions of user now, right?  

5. Why swagger, your app looks simple?  
A. It won't when more functions is added, plus, swagger is helpful in testing too.  

