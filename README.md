# Virtual Asset Bazaar v1.0.0


<div style="max-width: 600px; margin: 0 auto;">
 <p align="center"> 
 <img src="VAB.jpg" width="500" height="400" alt="Image">
</p>
    <p align="center"><i>Le Marché Collectionnable de Léonore - NFT</i></p>
    <p align="center">
        <a href="https://opensea.io/assets/ethereum/0x495f947276749ce646f68ac8c248420045cb7b5e/62866930848996523408574404963902188723455199371022574363884716480068973494273/" target="_blank">
            View OpenSea minted NFT:
        </a>
    </p>
</div>


<br><br><br>
# Project Description:

VirtualAssetBazaar is a technological platform designed to facilitate the transaction and management of unique virtual collectible assets. Through our online platform, users have the capability to explore, list, purchase, and sell a wide variety of digital assets. We implement advanced technologies to ensure the authenticity and security of assets, while also providing a seamless user experience in navigation, searching, and participating in auctions.Collectors can access a digital marketplace where technology supports the reliable and efficient buying and selling of virtual assets.


# Requirements to run it locally:

* [Docker](https://docs.docker.com/engine/install/ubuntu/)
* [NodeJS](https://nodejs.org/en/download "NodeJS")
* [Redis](https://redis.io/docs/getting-started/)

# Installation instructions:

## Before start, to use the project locally install Redis for your specific OS system:



```sh
https://redis.io/docs/getting-started/installation/
```
After this, fot linux subsystem for windows:
```sh
sudo service redis-server start
```
* *Redis should respond: `Starting redis-server: redis-server` after setting your password*.

Once the local server is started on  (localhost:defaultPort) use:
```sh
redis-cli
```
* *You should see in the console the host and the port: `127.0.0.1:6379>`*

## Then, going back to our backend, you can install the dependencies from Node:

```sh
npm install
```

## Now you can run the development server in the port 3000🚀🚀👩‍🚀:

```sh
npm run dev
```
* *Make sure you are in the rigth folder to run this command.*
* *Console will tell you if you are connected to you Redis in-memory database and in wich port the server is running*

## To run production ready code 🌙👨‍🚀🛸:

```sh
npm start
```
* *Make sure you are in the rigth folder to run this command.*



This will create a local server in your app on the port specified in the `index.js` file:

```sh
http://localhost:3000/
```

# Tests:

Run the unit tests:

```sh
  npm test
```


# Docker:

Create the Docker image:

```sh
  docker build -t virtualbazaar .
```

* *This will run our docker image.*

Run the container:

```sh
  docker run -p 3000:3000 virtualbazaar
```

* *This is just for development purposes, you can see `Dockerfile` file for more details.*


# HTTP petitions you can run on Postman:

## To CREATE a listing:

Set Postman to POST with this url:

```sh
  http://localhost:3000/api/v1/listings
```

Then configure the `Body` to `raw` and make sure it returns `JSON` as response.

After that, create a JSON that files all required fields:
```sh
{
  "title": "My list",
  "description": "List description",
  "price": 100,
  "isAuction": false
}
```
*This is an example, the JSON will be updated adding possible new required fields. In this commit, code works with this JSON.*

The POST request should return:
```sh
{
    "id": 1234567890123,
    "title": "Mi list",
    "description": "List description",
    "price": 100,
    "isAuction": false
}
```

* *This is an example id, and just example data.*
* *Make sure to write numbers where numbers go, and text, where you see text string on this JSON otherwise will not work.*

# To see listings by id:

Set Postman to GET with this url:

```sh
  http://localhost:3000/api/v1/listings/copyIDhere
```
* *If there's no listings server will throw a message telling you.*

# To see all listings:

Set Postman to GET with this url:

```sh
  http://localhost:3000/api/v1/listings/
```
* *If there's no listings server will throw a message telling you.*

# To UPDATE a listing:

Set the HTTP method to PUT, and insert this url:

```sh
  http://localhost:3000/api/v1/listings/IDnumber
```
After this go to Headers and set the Headers to Key `Content-Type` and Value to `application/json`.

Then insert the new json with the new fields updated(if the listing exist):

```sh
  {
    "id": 1111112222,
    "title": "New title updated",
    "description": "New description updated",
    "price": 150,
    "isAuction": true
}
```

* *Make sure `Body` is configured to `raw` and its parsing to `JSON`.*

# To DELETE the listing:

Set the HTTP method to DELETE inside Postman and insert the following url:

```sh
http://localhost:3000/api/v1/listings/IDnumber
```
* *Id number should be an existing id listed*

Then, press SEND and the selected listing should be eliminated .

# See VirtualBazaar code demo:

- *Virtual Bazaar link goes here* 

# See VirtualBazaar code documentation:
* *This document still in development* ☺
<p>
  <a href="https://docs.google.com/document/d/1RjNlJgQHLSLyZ3Y6WRuQCP5nKYYOUX-1hZjWnutg_ro/edit?usp=sharing" target="_blank">
   Link to code documentation
  </a>
</p>