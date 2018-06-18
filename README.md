# Olala
just trying some stuffs in node js


# Disclaimer
I am super beginner on docker / promises so don't be that hard on me :) 
This project is to try some new stuffs by building API in nodejs (I come from PHP background) 


# Prerequisite
Since I am a docker/node noob, I cant really tell you how to solve this or that error if you use stuffs that are different than mine.  
I am using CentOS7 (inside virtual machine)


# Install
## Docker / Docker compose way
```
docker-compose up --build  
```

## normal installation (guaranteed to run? maybe)
```
npm install
npm start
```
Note that I set database port to 27018, so you might want to either change my configs codes or set your db to listen to port 27018


#Use
To try if the installation is okay, go to: http://localhost:3000/ or http://0.0.0.0:3000/  
for documentation, go to http://0.0.0.0:3000/api-docs/

#Test
```
npm test
```

# Features
Scalability
Docker images
Swagger API




# Next Version...Maybe
Load Balancer implementation. 


(technically, I can even create a simple load balancer using expressJS that have a list of servers that have my app, then distribute the load between all of them.
in that case, my codes are ready to do that assuming that all the app are conecting to the same db/clustered db, but since I dont have clear idea yet on what the 
docker do behind the scenes, and I haven't tried to shard mongodb, I'll put this to future release... when I am more free)


#FAQ
1. What is "Olala"  
A. Obviously you are not French, are you? In the words of Abraham Lincoln:
> Pardon my French

2. Why the hassle, just dont use docker  
A. Then it won't be difficult enough for me.  

3. Since you come from PHP background, why not use it?  
A. So I can't try new stuffs because I am from PHP backgrounds?  

