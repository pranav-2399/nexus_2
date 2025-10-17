# 🧠 Express.JS Short-URL Creator Backend

The repository contains a simple **Express JS backend** with **MongoDB** database and tested using **Postman**.  
The data is stored in a collection of documents inside the database **`nexus_2`**.

Pre-requisites:
  ``` javascript
  npm init
  npm install express
  npm install mongodb
  ```

To start the server ```index.js```
   ```javascript
   node index.js
   ```

## 📄 `index.js`

Every time the server runs, it checks for the database *nexus_2* along with three collections, DB_1, DB_2, DB_# in the MongoDB server.
If it doesn't exist, they are created before hand.

This file defines **two API endpoints:**

- `/get_short_URL`  
- `/${hash}`  

### 🟦 `/get_short_URL` Endpoint

Receives the long URL. The URL is first checked if it is valid or not.
Then, a time-based hashing technique is applied in order to create a 7-bit base-62 string, which can accomodate around *3500 billion URLs*.
Once hashed, the key, along with the original URL passes through a filter to select a shard (done via modulo operation). 
By maintaing three shards, the load on a single database is reduced.
The document, with access count initialized to zero is inserted into the database.

  ```javascript
  app.get("/get_short_URL", async (req, res, next) => {
      const data = req.body.URL;
      if (data === undefined){
          next(error);
      } else if (!isValidURL(data)){
          next(error);
      } else {
          const hashKey = createHashKey();
          let shorter = "".concat(DOMAIN, PORT, "/", hashKey)
          const document = {...};
  
          const database = "".concat("DB_", modulo3(hashKey));
          const response = await insertDatabase(database, document);
  
          if (response.status === 200){
              res.status(response.status).send({...});
          } else {
              res.status(response.status).send(response);
          }
      }
  });
  ```

The API route uses utility functions for hashing and checking the validity. 
Database operations are kept in a separate file to prevent multiple database client instances.

### 🟩 `/${hash}` Endpoint

This API endpoint received the hashed key as a route parameter. The middleware retrieves it and searched for the key in its appropriate shard.
If the document is found, its access count is incremented by 1 to indicate that it has been viewed once. 
If the document is not found, the database handler sends a 404 error to the server. 
In case of any other unexpected errors, a status code of 500 along with error stack is sent.

  ```javascript
  app.get("/:hash", async (req, res, next) => {
      ...
      if (hashKey.length !== 7){
          ...
          next(error);
      } else {
          const database = "".concat("DB_", modulo3(hashKey));
          const result = await findDatabase(database, hashKey);
          if (result.status === 200){
              res.status(result.status).send({...})
          } else {
              res.status(result.status).send(result);
          }
      }
  })
  ```
