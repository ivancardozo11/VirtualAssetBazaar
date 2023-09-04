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
After this, for linux subsystem for windows:
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

* *This will create our docker image.*

Run the container:

```sh
  docker run -p 3000:3000 virtualbazaar
```

* *This is just for development purposes, you can see `Dockerfile` file for more details.*


# See VirtualBazaar code demo:

- *Virtual Bazaar link goes here* 

# See VirtualBazaar code documentation:
* *This document still in development* ☺
<p>
  <a href="https://docs.google.com/document/d/1RjNlJgQHLSLyZ3Y6WRuQCP5nKYYOUX-1hZjWnutg_ro/" target="_blank">
   Link to code documentation
  </a>
</p>

# Bare minimum requirements:

* *This sections takes you to documents where it shows a flow of how is expected the code to bare each requirement:*

## REST API to allow users to list their NFTs with fixed price or as an auction.
<p>
  <a href="https://docs.google.com/document/d/12wU-UzzqWC37Ia4gnSZAcexOUmkFVpWvpxhxEe096Uk" target="_blank">
    Creating a Listing with Fixed Price Flow:
  </a>
</p>

<p>
  <a href="https://docs.google.com/document/d/1WMaDQy157rDQ07YCgoZ9J4o-VtSQp2WFRZcYG8vW808" target="_blank">
   Creating a Listing with Auction Price Flow:
  </a>
</p>

## REST API to allow users to place bids on auctions or to purchase a token
<p>
  <a href="https://docs.google.com/document/d/1bDp0wfacVY82D7D9o6yxXWEy1fQEuz-He8CvQq40viU" target="_blank">
    Placing Bids on Auctions Flow:
  </a>
</p>

<p>
  <a href="https://docs.google.com/document/d/1NbjSrYLPQVHDGjlv7SqwNYGHc2VAFXYZ9km7AHFE3cg" target="_blank">
   Purchasing a Token Flow
  </a>
</p>

## Use Postman to simulate User A & User B

<p>
  <a href="https://docs.google.com/document/d/1q1vLbFm-niE6eM1VpSUaf0XsL_2-n3cOmWM9MYb303I" target="_blank">
   Flow from user A to B
  </a>
</p>

## Flow of auctions being finished.
<p>
  <a href="https://docs.google.com/document/d/1hOnhVVN-BTtDdUnIHz3zYhVQ5mf_A1jcj1RIwNiqdF0" target="_blank">
   Once users agree on terms through the APIs, send the transaction from
the backend to settle the trade (calling finishAuction(...args))
  </a>
</p>




