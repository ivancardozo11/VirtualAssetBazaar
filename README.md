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

# Three-Layer architecture Explanation:


Our NFT market project is built upon a Three-Layer Architecture, which separates the application into three distinct layers: Presentation, Business Logic, and Data Access. This separation offers several benefits:

- **Clear Separation:** Each layer has specific responsibilities, leading to better code organization and maintenance.
- **Scalability:** Individual layers can be scaled independently, improving performance.
- **Modularity:** Layers can be developed separately, promoting reusability and flexibility.
- **Enhanced Security:** Different layers allow for focused security measures.
- **Technology Flexibility:** Each layer can use suitable technologies.


## Controller Layer:

**Role:** The Controller Layer, a part of the Business Logic, performs crucial functions for core application operations.

**Function:** These components interpret incoming HTTP requests, interact with various services, and generate corresponding responses.

**Response Generation:** Controllers are responsible for generating accurate HTTP responses, providing clear indications of success or failure for requested actions.

**Interaction with Services:** In collaboration with the service layer, controllers orchestrate data-related operations, ensuring a clear separation of business logic and data manipulation.

**File Interaction:** Controllers closely interact with data access services, ensuring data integrity and consistent behavior throughout the application.

In essence, controllers serve as the bridge between user requests and the underlying business logic, contributing to a well-structured and scalable architecture.


## Business Logic Layer (Services):
**Role:** The Business Logic Layer, also known as the Services Layer, orchestrates core functionalities, ranging from managing listings to upcoming NFT creation and interactions with blockchain contracts.

**Function:** This layer handles intricate operations. It ensures data accuracy, coordinates access to local data, and interfaces with the Redis cache. It is slated to integrate with blockchain contracts for NFT creation and interaction.

**Flow:** Upon the arrival of a request via controllers, services execute the requisite logic. They interact with the data layer for CRUD operations, utilizing both local storage and cache. These services will soon encompass interaction with smart contracts, streamlining asset creation and management. Responses are communicated back to clients via controllers, ensuring a seamless interaction experience.

This versatile layer lays the groundwork for blockchain integration and optimized data management. It offers scalable and efficient functionality while preparing for advanced asset management through blockchain technologies.


## Data Layer:
**Role:** The Data Layer serves as the cornerstone of data management, leveraging advanced techniques like in-memory storage and caching for optimized, high-performance operations.

**Function:** This layer takes on the responsibility of efficiently storing, organizing, and delivering listing data. It harnesses in-memory data structures for rapid access, reducing latency and enhancing scalability. The Data Layer orchestrates CRUD operations on listings, establishing a robust foundation for the application's core functionalities.

**Flow:** When services initiate requests, the Data Layer springs into action, managing the intricate tasks of data storage and retrieval. It seamlessly integrates with Redis cache, a powerful caching mechanism, to expedite data access. This collaborative approach accelerates response times for data-intensive operations, facilitating swift interactions with blockchain contracts for seamless NFT activities.


## Utils File:
**Role:** The Utility file plays a pivotal role in enhancing code modularity and reusability.

**Function:** This file encapsulates utility functions that streamline various tasks across different parts of the application. These functions handle tasks such as validation, data transformation, and other common operations. By centralizing these functions in a utility file, code readability is improved, redundancy is minimized, and maintenance becomes more efficient.

**Importance:** The Utility File promotes cleaner and more organized code by encapsulating commonly used functionalities. It prevents code duplication and encourages consistent coding practices, contributing to overall code quality and developer productivity.

**Benefits:** By having a dedicated Utility File, ensures that commonly used functions are easily accessible throughout the application, fostering code modularity, readability, and maintainability.

## Routes File:
**Role:** Define the endpoints and routes that clients can access to interact with the application.

**Function:** These files establish a structured and organized way to handle incoming requests. Each route corresponds to a specific functionality, such as listing creation, retrieval, or updates. By defining routes, the application ensures that client requests are directed to the appropriate controller functions for processing.

**Importance:** The Route Files contribute to the separation of concerns within the application, keeping route-related logic separate from business logic. This promotes a clean and maintainable codebase, making it easier to manage and expand the application's functionality.

**Benefits:** Leverages Route Files to define a clear and consistent API structure. This structure enhances API usability and ensures that clients can interact with the application in a straightforward manner. It also allows for easy addition of new routes as the application evolves.


## Linter config file:

The `.eslintrc.json` file in the app defines linting rules aimed at maintaining code quality and consistency. The app uses the Standard style guide, a popular and widely-adopted set of linting rules.

Some key rules within this configuration include:

- **indent:** This rule mandates consistent four-space indentation, which enhances code readability and structure.

- **semi:** Requiring semicolons at statement ends enforces a consistent coding style.

- **no-trailing-spaces:** The rule identifies and flags trailing spaces, reducing superfluous whitespace and promoting cleaner code.

- **eqeqeq:** Encouraging the use of strict equality (`===`) for comparisons mitigates potential type coercion issues.

- **quote-props:** The rule enforces a consistent quotation style for object properties, contributing to code clarity.

- **no-var:** By favoring `const` and `let` over `var` for variable declarations, the rule enhances code readability and variable scoping.

- **no-unused-vars:** Detecting unused variables aids in eliminating redundant code and potential bugs.

- **space-infix-ops:** This rule mandates consistent spacing around infix operators, bolstering code readability and uniformity.

In concert, these rules ensure the codebase aligns with established coding standards, which in turn helps prevent errors, fosters uniformity, and simplifies collaborative development efforts. The use of the Standard style guide further ensures a consistent and well-maintained codebase.


## index.js

 `Index.js` file is a crucial entry point in the project, serving as the main application file. It orchestrates the setup and configuration of the backend server, ensuring that incoming requests are handled effectively.

Here's a breakdown of what the `index.js` file does and why each component is important:

- **Import Statements:** The file begins by importing required external modules using ES6 syntax. These modules include `express` (for creating the server), `dotenv` (for managing environment variables), `helmet` (for enhancing security headers), `morgan` (for request logging), `cors` (for handling cross-origin requests), and the defined `routes` (which define API endpoints).

- **Environment Configuration:** The `dotenv.config()` call loads environment variables from a `.env` file, facilitating a convenient way to manage configuration settings and sensitive data.

- **Express App Setup:** An instance of the Express app is created using `express()`. The app will handle incoming HTTP requests and route them to the appropriate endpoints.

- **Middleware Setup:** Several middleware functions are added to the app using `app.use()` calls. These include:
  - `express.json()`: Parses incoming JSON requests.
  - `helmet()`: Sets security-related HTTP headers to enhance protection against common web vulnerabilities.
  - `morgan('dev')`: Logs incoming requests with the "dev" format for better development debugging.
  - `cors()`: Enables Cross-Origin Resource Sharing (CORS) to allow requests from different domains.

- **Route Handling:** The `routes` imported from the routes file are mounted under the `/api/v1` prefix using `app.use()`. This ensures that incoming requests with paths starting with `/api/v1` are handled by the defined API endpoints.

- **Server Configuration:** The `port` variable is set based on the environment variable `PORT` from `.env` or a default value of `3000`.

- **Server Startup:** The `app.listen()` call starts the server on the specified port. A log message is displayed in the console to indicate that the server is up and running.

# Requirements to run it locally:

* [Docker](https://docs.docker.com/engine/install/ubuntu/)
* [NodeJS](https://nodejs.org/en/download "NodeJS")
* [Redis](https://redis.io/docs/getting-started/)

## Dependencies and DevDependencies

In the project, we leverage a set of essential dependencies and devDependencies to power our application's features and streamline development. Let's take a closer look at what each of these dependencies brings to the table within the context of our application:

### Dependencies:
- **cors (^2.8.5):** We use this to handle Cross-Origin Resource Sharing (CORS), ensuring our server can efficiently manage requests from various domains.

- **dotenv (^16.3.1):** Our secret weapon for loading environment variables from a `.env` file. It keeps our configuration organized and sensitive data secure.

- **express (^4.18.2):** The backbone of our server, built with this fast and minimalistic web framework that handles routes, requests, and responses.

- **helmet (^7.0.0):** Security is paramount. Helmet helps us fortify our application by setting essential HTTP headers that prevent common web vulnerabilities.

- **joi (^17.9.2):** Keeping data validation robust, we employ this validation library to ensure input and data conform to our predefined schemas.

- **jsonwebtoken (^9.0.1):** Our trusted ally for handling JSON Web Tokens (JWTs), empowering us to authenticate and authorize users securely.

- **morgan (^1.10.0):** Debugging and monitoring become seamless with this request logging middleware, allowing us to keep track of incoming HTTP requests.

- **redis (^4.6.7):** We capitalize on Redis as a powerful in-memory data store for caching and enhancing data retrieval performance.

- **web3 (^4.1.1):** Blockchain interaction becomes accessible through this JavaScript library, enabling us to mint NFTs and seamlessly interact with smart contracts.

### DevDependencies:
- **chai (^4.3.7):** Our trusted companion in testing, offering assertion functions that ensure our code meets expectations during unit and integration tests.

- **eslint (^8.47.0):** Our vigilant linter, enforcing quality and consistency throughout our codebase, keeping it readable and maintainable.

- **eslint-config-standard (^17.1.0):** We follow the Standard style guide, and this configuration ensures our code adheres to its guidelines.

- **eslint-plugin-import (^2.28.1):** Simplifying import/export syntax, this plugin helps maintain our code's structure and readability.

- **eslint-plugin-node (^11.1.0):** Custom linting rules specific to Node.js environments assist us in ensuring our server-side code is optimized.

- **eslint-plugin-promise (^6.1.1):** This plugin offers insightful rules for handling promises, resulting in more reliable asynchronous code.

- **eslint-plugin-standard (^5.0.0):** Aligning with the Standard style guide, this plugin guides us in maintaining code consistency and best practices.

- **mocha (^10.2.0):** Our testing partner, enabling flexible and asynchronous testing scenarios, ensuring the reliability of our code.

- **nodemon (^3.0.1):** This utility becomes indispensable during development by automatically restarting our server whenever source code changes.

- **supertest (^6.3.3):** Our tool of choice for testing API endpoints, it ensures our routes perform as expected, providing a seamless experience to users.

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

## Then you can install the dependencies:

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
node index.js
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
  "title": "Mi Listado",
  "description": "Descripción del listado",
  "price": 100,
  "isAuction": false
}
```
*This is an example, the JSON will be updated adding possible new required fields. In this commit, code works with this JSON.*

The POST request should return:
```sh
{
    "id": 1234567890123,
    "title": "Mi Listado",
    "description": "Descripción del listado",
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
    "title": "Nuevo título actualizado",
    "description": "Nueva descripción actualizada",
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

